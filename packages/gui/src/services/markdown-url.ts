export const escapeMarkdownAssetUrl = (url: string) => {
  const filenameStart = url.lastIndexOf('/') + 1;
  return `${url.slice(0, filenameStart)}${url.slice(filenameStart).replace(/_/g, '%5F')}`;
};
