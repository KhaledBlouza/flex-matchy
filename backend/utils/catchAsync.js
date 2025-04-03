// Wrapper pour capturer les erreurs asynchrones et les transmettre à Express
module.exports = fn => {
    return (req, res, next) => {
      fn(req, res, next).catch(next);
    };
  };