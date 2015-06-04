import app from 'ampersand-app';
import Router from 'ampersand-router';
import React from 'react';
import PublicPage from './pages/public';
import ReposPage from './pages/repos';
import qs from 'qs';
import xhr from 'xhr';
import Layout from './components/layout';

function auth(handlerName) {
	return function () {
		if (app.me.token) {
			this[handlerName].apply(this, arguments);
		} else {
			this.redirectTo('/');
		}
	}
}

export default Router.extend({
	renderPage (page, opts = {layout: true}) {
		if(opts.layout) {
			page = (
				<Layout>
					{page}
				</Layout>
			)
		}

		React.render(page, document.body);
	},

	routes: {
		'': 'public',
		'repos': auth('repos'),
		'login': 'login',
		'logout': 'logout',
		'auth/callback?code=:code': 'authCallback'
	},

	public () {
		this.renderPage(<PublicPage/>, {layout: false});
	},

	repos () {
		this.renderPage(<ReposPage repos={app.me.repos}/>);
	},

	login () {
		window.location = 'https://github.com/login/oauth/authorize?' + qs.stringify({
		  scope: 'user,repo',
		  redirect_uri: window.location.origin + '/auth/callback',
		  client_id: 'f8dd69187841cdd22a26'
		})
	},

	logout () {
		window.localStorage.clear();
		window.location = '/';
	},

	authCallback (code) {
		xhr({
			url: 'http://labelr-dev.herokuapp.com/authenticate/' + code,
			json: true
		}, (error, request, response) => {
			if(response.token) {
				app.me.token = response.token;

				this.redirectTo('/repos');
			}
		})
	}

});