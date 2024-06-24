'use strict';

const winston = require.main.require('winston');

const meta = require.main.require('./src/meta');
const user = require.main.require('./src/user');
const groups = require.main.require('./src/groups');

const plugin = {};

plugin.postQueue = async function ({ shouldQueue, uid, data }) {
	try {
		if(!(await user.isPrivileged(uid)) &&
			!(await groups.isMemberOfAny(uid, meta.config.groupsExemptFromPostQueue)) &&
			(/\!\[.*\]\(.+\.(jpg|png|gif|jpeg)\)/i.test(data.req.body.content)) ||
			(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm.test(data.req.body.content))	)
		{
			shouldQueue = true;
		}
	} catch (err) {
		winston.error(`[plugin/${plugin.id}] Error: ${err.message}`);
	}

	return { shouldQueue, uid, data };
};

module.exports = plugin;
