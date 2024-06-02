function getFileNameFromUrl(url, lead_id) {
  const matches = url.match(/\/([^\/?#]+)$/);
  if (matches) {
    const fileName = matches[1];
    const dotIndex = fileName.lastIndexOf(".");
    if (dotIndex !== -1) {
      const extension = fileName.substring(dotIndex + 1);
      // const name = fileName.substring(0, dotIndex);
      return {
        url,
        name: lead_id,
        extension
      };
    }
  }
}

module.exports = getFileNameFromUrl;