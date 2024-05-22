class BdController {
  index(req, res) {
    res.json({message: 'Hello from BD controller'});
  }
}

module.exports = new BdController();