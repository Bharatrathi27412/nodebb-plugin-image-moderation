'use strict';

// const { user } = require('../../src/controllers');
const controllers = require('./lib/controllers');
const winston = require.main.require('winston');

const meta = require.main.require('./src/meta');
const topics = require.main.require('./src/topics');
const categories = require.main.require('./src/categories');
const routeHelpers = require.main.require('./src/routes/helpers');
const user = require.main.require('./src/user');
const groups = require.main.require('./src/groups');

const plugin = {};

plugin.init = function (params, callback) {
	const router = params.router;
	const hostMiddleware = params.middleware;
	// const hostControllers = params.controllers;

	// We create two routes for every view. One API call, and the actual route itself.
	// Just add the buildHeader middleware to your route and NodeBB will take care of everything for you.

	router.get('/admin/plugins/image-moderation', hostMiddleware.admin.buildHeader, controllers.renderAdminPage);
	router.get('/api/admin/plugins/image-moderation', controllers.renderAdminPage);

	callback();
};

plugin.addAdminNavigation = function (header, callback) {
	header.plugins.push({
		route: '/plugins/image-moderation',
		icon: 'fa-tint',
		name: 'image-moderation',
	});

	callback(null, header);
};

plugin.postQueue = async function ({ shouldQueue, uid, data }) {
	try {
		if(!(await user.isPrivileged(uid)) &&
			!(await groups.isMemberOfAny(uid, meta.config.groupsExemptFromPostQueue)) &&
			(/\!\[.*\]\(.+\.(jpg|png|gif|jpeg)\)/i.test(data.req.body.content))	)
		{
			shouldQueue = true;
		}
	} catch (err) {
		winston.error(`[plugin/${plugin.id}] Error: ${err.message}`);
	}

	return { shouldQueue, uid, data };
};

module.exports = plugin;
