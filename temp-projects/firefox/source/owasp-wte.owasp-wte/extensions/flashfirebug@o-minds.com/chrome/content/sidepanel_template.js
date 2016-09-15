/* See license.txt for terms of usage */

FBL.ns(function() { with (FBL) {

// Constants ************************************************************************************************

const panelName="ffbugprop";
const panelTitle="Proprties";
const parentPanelName="ffbug";

// Module ***************************************************************************************************

Firebug.FlashModuleProp = extend(Firebug.Module,
{
	initialize: function() {
		this.panelName = panelName;
		Firebug.Module.initialize.apply(this, arguments);
	},
	shutdown: function()
    {
        Firebug.Module.shutdown.apply(this, arguments);
    }
});

// Panel ****************************************************************************************************

Firebug.FlashPanelProp = function() {};

Firebug.FlashPanelProp.prototype = extend(Firebug.Panel,
{
    name: panelName,
	title: panelTitle,
    parentPanel:parentPanelName,
    initialize: function(context,doc)
    {
        Firebug.Panel.initialize.apply(this, arguments);
    },
    destroy: function(state)
    {
        Firebug.Panel.destroy.apply(this, arguments);
    },	
    getOptionsMenuItems: function()
    {
        return [{
				label: "test1",
				nol10n: true,
				type: "checkbox",
				command: function() { alert("Hello1!"); }
				}];
    },
});

// Registration ***********************************************************************************************

Firebug.registerModule(Firebug.FlashModuleProp);
Firebug.registerPanel(Firebug.FlashPanelProp);

// ************************************************************************************************
}});
