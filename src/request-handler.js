module.exports = function (app, logger) {
  const logic = require('./logic')(logger);
  const routing = require('./logic/routing')(logger);

  /* EVENT LISTENERS */

  /**
   * EVENT: app_mention
   * Responds with a help message anytime someone mentions
   * the support bot.
   */
  app.event('app_mention', async ({ client, payload }) => {
    try {
      logger.info('EVENT: app_mention');

      await logic.postHelpMessageToUserOnly(
        client,
        payload.channel,
        payload.user
      );
    } catch (error) {
      logger.error(error);
    }
  });

  /**
   * EVENT: reaction_added
   * Captures the current time the first emoji reaction to a
   * support ticket.
   */
  app.event('reaction_added', async ({ payload }) => {
    try {
      logger.info('EVENT: reaction_added');

      // payload.item.ts is the associated message id of the emoji reaction
      await logic.updateTimeStampOfSupportResponse(payload.item.ts);
    } catch (error) {
      logger.error(error);
    }
  });

  /**
   * EVENT: member_joined_channel
   * Sends a help message when a user joins the channel.
   */
  app.event('member_joined_channel', async ({ event, client }) => {
    try {
      logger.info('EVENT: member_joined_channel');

      await logic.postHelpMessageToUserOnly(client, event.channel, event.user);
    } catch (error) {
      logger.error(error);
    }
  });

  /* MESSAGE LISTENERS */

  /**
   * MESSAGE: any
   * Listens to any messages on the channel to determine if
   * the message is a reply to a support ticket.  If the reply
   * is the first reply, capture the current time of the reply.
   */
  app.message('', async ({ message }) => {
    try {
      logger.info('MESSAGE: *');

      // message.thread_ts only exists for replies
      await logic.updateTimeStampOfSupportResponse(message.thread_ts);
    } catch (error) {
      logger.error(error);
    }
  });

  /* ACTION LISTENERS (BUTTON CLICK HANDLERS) */

  /**
   * Action: platform_support
   * This function gets called when the green button "Platform Support Request"
   * is clicked on.  It brings up the platform support request modal.
   */
  app.action('platform_support', async ({ ack, body, client }) => {
    try {
      logger.info('ACTION: platform_support');

      await ack();

      await logic.displaySupportModal(client, body.user.id, body.trigger_id);
    } catch (error) {
      logger.error(error);
    }
  });

  /**
   * Action: reassign_ticket
   * This function gets called when the "Reassign Ticket" button
   * is clicked on.  It brings up a reassign ticket modal.
   */
  app.action('reassign_ticket', async ({ ack, body, client, payload }) => {
    try {
      logger.info('ACTION: reassign_ticket');

      await ack();

      await logic.displayReassignmentModal(
        client,
        payload.value,
        body.trigger_id
      );
    } catch (error) {
      logger.error(error);
    }
  });

  /* COMMAND LISTENERS */

  /**
   * Command: /help
   * Respond with Ephemeral help message anytime someone
   * types in the /help command.
   */
  app.command('/help', async ({ ack, body, client }) => {
    try {
      logger.info('COMMAND: /help');

      await ack();

      await logic.postHelpMessageToUserOnly(
        client,
        body.channel_id,
        body.user_id
      );
    } catch (error) {
      logger.error(error);
    }
  });

  /**
   * Command: /support
   * Brings up the platform support request modal when someone
   * types the /support command.
   */
  app.command('/support', async ({ ack, body, client }) => {
    try {
      logger.info('COMMAND: /support');

      await ack();

      await logic.displaySupportModal(client, body.user_id, body.trigger_id);
    } catch (error) {
      logger.error(error);
    }
  });

  /* COMMAND LISTENERS */

  /**
   * Shortcut: support
   * Brings up the platform support request modal when someone
   * clicks on the Platform Support bot's shortcut in the app.
   * (Note: Not the channel specific shortcut, the global one.)
   */
  app.shortcut('support', async ({ shortcut, ack, client }) => {
    try {
      logger.info('SHORTCUT: support');

      await ack();

      await logic.displaySupportModal(
        client,
        shortcut.user.id,
        shortcut.trigger_id
      );
    } catch (error) {
      logger.error(error);
    }
  });

/**
   * Command: /oncall
   * Brings up the platform support request modal when someone
   * types the /oncall command.
   */
 app.command('/oncall', async ({ ack, body, client }) => {
  try {
    logger.info('COMMAND: /oncall');

    await ack();

    await logic.displayOnCallModal(
      client,
      body.user_id,
      body.trigger_id
    );

  } catch (error) {
    logger.error(error);
  }
});



  /**
   * Shortcut: oncall
   * Brings up the platform on-call modal when someone
   * clicks on the Platform On-call bot's shortcut in the app.
   * (Note: Not the channel specific shortcut, the global one.)
   */
   app.shortcut('oncall', async ({ shortcut, ack, client }) => {
    try {
      logger.info('SHORTCUT: support');

      await ack();

      await logic.displayOnCallModal(
        client,
        shortcut.user.id,
        shortcut.trigger_id
      );
    } catch (error) {
      logger.error(error);
    }
  });

  /* VIEW LISTENERS */

  /**
   * View: support_modal_view
   * Handles the form submission when someone submits the Platform Support
   * form.
   */
  app.view('support_modal_view', async ({ ack, body, view, client }) => {
    try {
      logger.info('VIEW: support_modal_view (FORM SUBMISSION)');

      await ack();

      await logic.handleSupportFormSubmission(client, body, view);
    } catch (error) {
      logger.error(error);
    }
  });

    /**
   * View: oncall_modal_view
   * Handles the form submission when someone submits the oncall form.
   */
     app.view('oncall_modal_view', async ({ ack, body, view, client }) => {
      try {
        logger.info('VIEW: oncall_modal_view (FORM SUBMISSION)');
  
        await ack();
  
        await logic.handleOnCallFormSubmission(client, body, view);
      } catch (error) {
        logger.error(error);
      }
    });

  /**
   * View: reassign_modal_view
   * Handles the form submission when someone submits the reassigns
   * a ticket
   */
  app.view(
    'reassign_modal_view',
    async ({ ack, payload, client, view, body }) => {
      try {
        logger.info('VIEW: reassign_modal_view (FORM SUBMISSION)');

        await ack();

        await logic.handleReassignmentFormSubmission(client, payload, view, body);
      } catch (error) {
        logger.error(error);
      }
    }
  );
};
