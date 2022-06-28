function extractErrorMsgFromXML(r) {
  const e = new DOMParser();
  const t = e.parseFromString(r, "text/xml");
  return t.getElementsByTagName("error")[0].getElementsByTagName("message")[0]
    .childNodes[0].wholeText;
}
function extractErrorMsgFromJSON(r) {
  const e = JSON.parse(r.responseText);
  const t = e.error.message.value || "The error could not be parsed.";
  return t;
}
function parseError(r) {
  try {
    if (!r.responseText && r.message) return r.message;
    return extractErrorMsgFromJSON(r);
  } catch (e) {
    try {
      return extractErrorMsgFromXML(r);
    } catch (r) {
      return "The error message could not be parsed.";
    }
  }
}
sap.ui.define([], () => ({
  parse(r) {
    const e = parseError(r);
    return e;
  },
}));
