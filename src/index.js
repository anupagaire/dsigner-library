const { createClient } = require('./client');
const { signPdf } = require('./actions/signPdf');
const { signForm } = require('./actions/signForm');

module.exports = {
  createClient,
  signPdf,
  signForm
};