/**
 * Category Seeder Script
 *
 * Seeds the database with the complete 3-level category hierarchy.
 * Idempotent — skips categories that already exist by categoryId.
 *
 * Usage:  npm run seed:categories
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Category } from "../modules/categories/category.model.js";
import { categorySeedData } from "./seed-data/categories.js";

dotenv.config();

// ============================================================================
// Configuration
// ============================================================================

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("FATAL: MONGODB_URI is not defined in environment variables.");
    process.exit(1);
}

// ============================================================================
// Parent Cache — minimizes DB lookups
// ============================================================================

const parentCache = new Map();

const getCachedParent = (categoryId) => parentCache.get(categoryId);

const setCachedParent = (categoryId, categoryDoc) => {
    parentCache.set(categoryId, categoryDoc);
};

// ============================================================================
// Core Seeder Logic
// ============================================================================

const seedCategories = async () => {
    const startTime = Date.now();

    const stats = {
        level1Created: 0,
        level2Created: 0,
        level3Created: 0,
        skipped: 0,
    };

    try {
        // 1. Connect
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB.\n");

        // 2. Seed Level 1
        console.log("--- Seeding Level 1 ---");
        for (const root of categorySeedData) {
            const existing = await Category.findOne({ categoryId: root.categoryId }).lean();
            if (existing) {
                stats.skipped++;
                setCachedParent(root.categoryId, existing);
                console.log(`  SKIP  ${root.name} (already exists)`);
                continue;
            }

            const created = await Category.create({
                name: root.name,
                categoryId: root.categoryId,
                level: root.level,
                parentCategory: null,
            });

            const doc = created.toObject();
            stats.level1Created++;
            setCachedParent(root.categoryId, doc);
            console.log(`  +     ${root.name} (level 1)`);
        }

        // 3. Seed Level 2
        console.log("\n--- Seeding Level 2 ---");
        for (const root of categorySeedData) {
            if (!root.children) continue;

            for (const sub of root.children) {
                const existing = await Category.findOne({ categoryId: sub.categoryId }).lean();
                if (existing) {
                    stats.skipped++;
                    setCachedParent(sub.categoryId, existing);
                    console.log(`  SKIP  ${sub.name} (already exists)`);
                    continue;
                }

                const parentDoc = getCachedParent(root.categoryId);
                if (!parentDoc) {
                    console.error(`  FAIL  ${sub.name} — parent "${root.categoryId}" not found`);
                    continue;
                }

                const created = await Category.create({
                    name: sub.name,
                    categoryId: sub.categoryId,
                    level: sub.level,
                    parentCategory: parentDoc._id,
                });

                const doc = created.toObject();
                stats.level2Created++;
                setCachedParent(sub.categoryId, doc);
                console.log(`  +     ${sub.name} (level 2, parent: ${root.name})`);
            }
        }

        // 4. Seed Level 3
        console.log("\n--- Seeding Level 3 ---");
        for (const root of categorySeedData) {
            if (!root.children) continue;

            for (const sub of root.children) {
                if (!sub.children) continue;

                for (const leaf of sub.children) {
                    const existing = await Category.findOne({ categoryId: leaf.categoryId }).lean();
                    if (existing) {
                        stats.skipped++;
                        setCachedParent(leaf.categoryId, existing);
                        console.log(`  SKIP  ${leaf.name} (already exists)`);
                        continue;
                    }

                    const parentDoc = getCachedParent(sub.categoryId);
                    if (!parentDoc) {
                        console.error(`  FAIL  ${leaf.name} — parent "${sub.categoryId}" not found`);
                        continue;
                    }

                    const created = await Category.create({
                        name: leaf.name,
                        categoryId: leaf.categoryId,
                        level: leaf.level,
                        parentCategory: parentDoc._id,
                    });

                    const doc = created.toObject();
                    stats.level3Created++;
                    setCachedParent(leaf.categoryId, doc);
                    console.log(`  +     ${leaf.name} (level 3, parent: ${sub.name})`);
                }
            }
        }

        // 5. Summary
        const elapsed = Date.now() - startTime;
        const totalCreated = stats.level1Created + stats.level2Created + stats.level3Created;

        console.log("\n========================================");
        console.log("  SEEDING COMPLETE");
        console.log("========================================");
        console.log(`  Level 1 Created  : ${stats.level1Created}`);
        console.log(`  Level 2 Created  : ${stats.level2Created}`);
        console.log(`  Level 3 Created  : ${stats.level3Created}`);
        console.log(`  Skipped          : ${stats.skipped}`);
        console.log(`  Total Inserted   : ${totalCreated}`);
        console.log(`  Completed in     : ${elapsed}ms`);
        console.log("========================================\n");
    } catch (error) {
        console.error("\nSEEDING FAILED:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
};

seedCategories();
