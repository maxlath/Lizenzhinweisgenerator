/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
'use strict';

var $ = require( 'jquery' );

/**
 * Application Error
 * @constructor
 *
 * @param {string} code
 *
 * @throws {Error} if a required parameter is not defined properly.
 */
var ApplicationError = function( code ) {
	if( !code || typeof code !== 'string' ) {
		throw new Error( 'Required parameters are nor properly defined' );
	}

	this._code = code;
};

$.extend( ApplicationError.prototype, {
	/**
	 * @param {string}
	 */
	_code: null,

	/**
	 * Returns the error's localized message.
	 *
	 * @return {string}
	 */
	getMessage: function() {
		// FIXME: make this work with the i18n error messages
		return 'Error.';
	}

} );

module.exports = ApplicationError;
