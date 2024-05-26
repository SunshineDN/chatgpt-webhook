const LeadThread = require('../models/LeadThread');

class BdController {
  index(req, res) {
    res.json({ message: 'Hello from BD controller' });
  }

  async list(req, res) {
    const conversation = await LeadThread.findAll();
    res.json(conversation);
  }

  async dropTable(req, res) {
    await LeadThread.drop();
    res.json({ message: 'Table dropped' });
  }

  async deleteThread(req, res) {
    const { threadID } = req.params;
    await LeadThread.destroy({ where: { threadID } });
    res.json({ message: 'Thread deleted' });
  }
}

module.exports = new BdController();