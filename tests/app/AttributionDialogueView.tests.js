'use strict';

QUnit.module( 'AttributionDialogueView' );

var $ = require( 'jquery' ),
	AttributionDialogueView = require( '../../js/app/views/AttributionDialogueView' ),
	Messages = require( '../../js/app/Messages' ),
	Asset = require( '../../js/app/Asset' ),
	DialogueEvaluation = require( '../../js/app/DialogueEvaluation' ),
	LicenceStore = require( '../../js/app/LicenceStore' ),
	licences = new LicenceStore( require( '../../js/app/LICENCES' ) ),
	Helpers = require( '../TestHelpers' );

$.fx.off = true;

function dialogueContains( $dialogue, message ) {
	return $dialogue.text().indexOf( Messages.t( message ) ) > -1;
}

QUnit.test( 'render should show the first step', function( assert ) {
	var $dialogue = $( '<div/>' );
	Helpers.newDefaultAttributionDialogueView().render( $dialogue );

	assert.ok( dialogueContains( $dialogue, 'dialogue.type-of-use-headline' ) );
} );

QUnit.test( 'first step has two checkboxes', function( assert ) {
	var $dialogue = $( '<div/>' );
	Helpers.newDefaultAttributionDialogueView().render( $dialogue );

	assert.equal( $dialogue.find( 'input[type="checkbox"]' ).length, 2 );
} );

function renderDialogueAtStep( n, dialogue ) {
	var $dialogue = $( '<div/>' ),
		dialogue = dialogue || Helpers.newDefaultAttributionDialogueView();
	if( n > 3 ) {
		dialogue._dialogue._addEditingSteps();
	}
	dialogue._dialogue.setStep( n );
	dialogue.render( $dialogue );

	return { view: dialogue, dom: $dialogue };
}

QUnit.test( 'clicking a checkbox on first step submits and saves data', function( assert ) {
	var $dialogue = $( '<div/>' ),
		dialogue = Helpers.newDefaultAttributionDialogueView();
	dialogue.render( $dialogue );

	$dialogue.find( 'input:checkbox' )[ 0 ].click();
	assert.equal( dialogue._dialogue.getData()[ 'typeOfUse' ][ 'type' ], 'print' );
} );

QUnit.test( 'submitting the form should render second step', function( assert ) {
	var $dialogue = $( '<div/>' );
	Helpers.newDefaultAttributionDialogueView().render( $dialogue );

	$dialogue.find( 'input[type="checkbox"]' )[ 0 ].click();
	assert.ok( dialogueContains( $dialogue, 'dialogue.author-headline' ) );
	assert.notOk( dialogueContains( $dialogue, 'dialogue.type-of-use-headline' ) );
} );

QUnit.test( 'Author Step', function( assert ) {
	var dialogue = renderDialogueAtStep( 1 );

	assert.equal( dialogue.dom.find( 'input:checkbox' ).length, 1 );
	assert.equal( dialogue.dom.find( 'input:text' ).length, 1 );

	dialogue.dom.find( 'input:checkbox' ).click();
	assert.equal( dialogue.view._dialogue.getData()[ 'author' ][ 'no-author' ], 'true' );

	dialogue = renderDialogueAtStep( 1 );
	dialogue.dom.find( 'input:text' ).val( 'Blah' );
	dialogue.dom.find( 'button' ).click();
	assert.equal( dialogue.view._dialogue.getData()[ 'author' ][ 'author' ], 'Blah' );
} );

QUnit.test( 'Author Step does not accept empty author name', function( assert ) {
	var dialogue = renderDialogueAtStep( 1 );

	dialogue.dom.find( 'button' ).click();

	assert.ok( dialogueContains( dialogue.dom, 'dialogue.author-headline' ) );
	assert.notOk( dialogueContains( dialogue.dom, 'dialogue.compilation-headline' ) );

	dialogue = renderDialogueAtStep( 1 );
	dialogue.dom.find( 'input:text' ).trigger( $.Event( 'keydown', { which: 13 } ) );

	assert.ok( dialogueContains( dialogue.dom, 'dialogue.author-headline' ) );
	assert.notOk( dialogueContains( dialogue.dom, 'dialogue.compilation-headline' ) );
} );

QUnit.test( 'Compilation Step', function( assert ) {
	var dialogue = renderDialogueAtStep( 2 );

	assert.equal( dialogue.dom.find( 'input:checkbox' ).length, 2 );

	dialogue.dom.find( 'input:checkbox' )[ 0 ].click();
	assert.equal( dialogue.view._dialogue.getData()[ 'compilation' ][ 'compilation' ], 'true' );

	dialogue = renderDialogueAtStep( 2 );
	dialogue.dom.find( 'input:checkbox' )[ 1 ].click();
	assert.equal( dialogue.view._dialogue.getData()[ 'compilation' ][ 'compilation' ], 'false' );
} );

QUnit.test( 'Editing Step', function( assert ) {
	var dialogue = renderDialogueAtStep( 3 );

	assert.equal( dialogue.dom.find( 'input:checkbox' ).length, 2 );

	dialogue.dom.find( 'input:checkbox' )[ 0 ].click();
	assert.equal( dialogue.view._dialogue.getData()[ 'editing' ][ 'edited' ], 'true' );

	dialogue = renderDialogueAtStep( 3 );
	dialogue.dom.find( 'input:checkbox' )[ 1 ].click();
	assert.equal( dialogue.view._dialogue.getData()[ 'editing' ][ 'edited' ], 'false' );
} );

QUnit.test( 'Change Step', function( assert ) {
	var dialogue = renderDialogueAtStep( 4 );

	assert.equal( dialogue.dom.find( 'input:text' ).length, 1 );

	dialogue.dom.find( 'input:text' ).val( 'cropped' );
	dialogue.dom.find( 'button' ).click();
	assert.equal( dialogue.view._dialogue.getData()[ 'change' ][ 'change' ], 'cropped' );
} );

QUnit.test( 'Creator Step', function( assert ) {
	var dialogue = renderDialogueAtStep( 5 );

	assert.equal( dialogue.dom.find( 'input:text' ).length, 1 );

	dialogue.dom.find( 'input:text' ).val( 'Meh' );
	dialogue.dom.find( 'button' ).click();
	assert.equal( dialogue.view._dialogue.getData()[ 'creator' ][ 'name' ], 'Meh' );
} );

QUnit.test( 'Licence Step', function( assert ) {
	var dialogue = renderDialogueAtStep(
		6,
		new AttributionDialogueView( new Asset( '', '', licences.getLicence( 'cc-by-3.0-de' ) ) )
	);

	assert.equal( dialogue.dom.find( 'input:checkbox' ).length, 4 ); // 4 compatible licences + the original licence
	assert.equal( dialogue.dom.find( 'a[target="_blank"]' ).length, 4 );
} );

QUnit.test( 'Dialogue walkthrough', function( assert ) {
	var $dialogue = $( '<div/>' ),
		dialogue = new AttributionDialogueView( new Asset( '', '', licences.getLicence( 'cc-by-2.0' ) ) );
	dialogue.render( $dialogue );

	// Type of Use Step
	$dialogue.find( 'input:checkbox' )[ 1 ].click();

	// Author Step
	$dialogue.find( 'input:text' ).val( 'Blah' );
	$dialogue.find( 'button' ).click();

	// Compilation Step
	$dialogue.find( 'input:checkbox' )[ 0 ].click();

	// Editing Step
	$dialogue.find( 'input:checkbox' )[ 0 ].click();

	// Change Substep
	$dialogue.find( 'input:text' ).val( 'cropped' );
	$dialogue.find( 'button' ).click();

	// Creator Substep
	$dialogue.find( 'input:text' ).val( 'Meh' );
	$dialogue.find( 'button' ).click();

	// Licence Substep
	$dialogue.find( 'input:checkbox' )[ 4 ].click();

	// Done!
	assert.ok( dialogueContains( $dialogue, 'dialogue.done-headline' ) );
	assert.ok(
		$dialogue.html().indexOf(
			new DialogueEvaluation(
				dialogue._dialogue._asset,
				dialogue._dialogue.getData()
			).getAttribution()
		) !== -1
	);

	var expectedDosAndDonts = {
		dos: [ 'online', 'compilation' ],
		donts: [ 'terms-of-use', 'sublicences', 'cc-licence', 'technical-protection' ]
	};
	$.each( expectedDosAndDonts.dos, function( _, d ) {
		assert.ok( $dialogue.text().indexOf( Messages.t( 'evaluation.do-' + d + '-text' ) ) !== -1 );
	} );
	$.each( expectedDosAndDonts.donts, function( _, dont ) {
		assert.ok( $dialogue.text().indexOf( Messages.t( 'evaluation.dont-' + dont + '-headline' ) ) !== -1 );
		assert.ok( $dialogue.text().indexOf( Messages.t( 'evaluation.dont-' + dont + '-text' ) ) !== -1 );
	} );

	assert.equal( dialogue._dialogue.getData()[ 'typeOfUse' ][ 'type' ], 'online' );
	assert.equal( dialogue._dialogue.getData()[ 'author' ][ 'author' ], 'Blah' );
	assert.equal( dialogue._dialogue.getData()[ 'compilation' ][ 'compilation' ], 'true' );
	assert.equal( dialogue._dialogue.getData()[ 'editing' ][ 'edited' ], 'true' );
	assert.equal( dialogue._dialogue.getData()[ 'change' ][ 'change' ], 'cropped' );
	assert.equal( dialogue._dialogue.getData()[ 'creator' ][ 'name' ], 'Meh' );
	assert.equal( dialogue._dialogue.getData()[ 'licence' ][ 'licence' ], 'cc-by-3.0' );
} );

QUnit.test( 'show done after completing last step', function( assert ) {
	var dialogue = renderDialogueAtStep( 3 );
	dialogue.dom.find( 'input:checkbox' )[ 1 ].click();
	assert.ok( dialogueContains( dialogue.dom, 'dialogue.done-headline' ) );
} );
