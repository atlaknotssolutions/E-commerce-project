/**
 * Pure function-based template renderer for notification messages.
 * Supports {{variable}} placeholders with safe defaults.
 */
export const createTemplateRenderer = () =>
{
  const render = (template, variables = {}) =>
  {
    if (!template || typeof template !== 'string') return '';

    return template.replace(/\{\{(\w+)\}\}/g, (match, key) =>
    {
      return variables[key] !== undefined ? variables[key] : '';
    });
  };

  const renderChannelContent = (channelContent, variables = {}) =>
  {
    if (!channelContent) return {};

    const rendered = {};
    for (const [channel, content] of Object.entries(channelContent))
    {
      if (typeof content === 'string')
      {
        rendered[channel] = render(content, variables);
      }
      else if (typeof content === 'object' && content !== null)
      {
        rendered[channel] = {};
        for (const [field, value] of Object.entries(content))
        {
          rendered[channel][field] = typeof value === 'string'
            ? render(value, variables)
            : value;
        }
      }
    }
    return rendered;
  };

  const extractVariables = (templateString) =>
  {
    if (!templateString || typeof templateString !== 'string') return [];
    const matches = templateString.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
  };

  return Object.freeze({ render, renderChannelContent, extractVariables });
};
