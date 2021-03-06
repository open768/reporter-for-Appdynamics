//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

//###############################################################################
var cMenus={
	METRIC_FIELD: "cmf.",
	TITLE_FIELD: "ctf.",
	APP_FIELD: "caf.",
	APP_QS:"app",
	APPID_QS:"aid",
	IGNORE_REF_QS: "igr",
	METRIC_TYPE_QS:"mt",
	METRIC_TYPE_ACTIVITY: "mac",
	METRIC_TYPE_RUMCALLS:"mrc",
	METRIC_TYPE_INFR_AVAIL:"mtia",
	NODE_QS:"nd",
	TIER_QS:"tier",
	TIER_ID_QS: "tid",
		
	//*********************************************************
	renderMenus: function(){	
		
		$("SELECT[type='appdmenus']").each( 
			function(pIndex, pElement){
				var oElement = $(pElement);
				oElement.appdmenu();
			}
		);
	}
}

var cTopMenu={
	pr__add_expansion: function(poDiv, psTitle, pbIsOpen){
		var oDetail = $("<details>",{class:"mdl-expansion"});
			if (pbIsOpen) oDetail.attr("open",1);

			var oSummary = $("<summary>", {class:"mdl-expansion__summary"});
				var oHeader = $("<span>", {class:"mdl-expansion__header"}).append(psTitle);
				oSummary.append(oHeader);
			oDetail.append(oSummary);
			
			var oContent = $("<div>", {class:"mdl-expansion__content"});
			oDetail.append(oContent);
		
		poDiv.append(oDetail);
		return oContent;
	},
		
	pr__add_to_expansion: function(poDiv, psCaption, psUrl){
		var $oLink = $("<a>", {class:"mdl-navigation__link",href:psUrl}).append(psCaption);
		poDiv.append($oLink);
	},
	
	render: function(poDiv){
		//check for required options
		var sController = poDiv.attr("controller");
		if (!sController) {	$.error("controller attr missing!");	}
		var sHome = poDiv.attr("home");
		if (!sHome) {	$.error("home attr missing!");	}
		
		var sAppPrefixUrl = sHome+"/pages/app";
		var sAllPrefixUrl = sHome+"/pages/all";
		var sRumPrefixUrl = sHome+"/pages/rum";
		
		
		//add the sections
		var oContentDiv;
		oContentDiv = this.pr__add_expansion(poDiv, "General", true);
			var oParams = {};
			oParams[cMenus.IGNORE_REF_QS] = 1;
			this.pr__add_to_expansion(oContentDiv, "Logout", cBrowser.buildUrl(sHome +"/index.php", oParams));
			this.pr__add_to_expansion(oContentDiv, "Login Token", sHome +"/pages/authtoken.php");
			this.pr__add_to_expansion(oContentDiv, "Link to this page", sHome +"/pages/link.php");
			this.pr__add_to_expansion(oContentDiv, "Appdynamics", "https://"+sController + "/controller/");

		
		oContentDiv = this.pr__add_expansion(poDiv, "Check");
			this.pr__add_to_expansion(oContentDiv, "Configuration", sAllPrefixUrl+"/config.php");
			this.pr__add_to_expansion(oContentDiv, "License Usage", sAllPrefixUrl+"/usage.php");
			this.pr__add_to_expansion(oContentDiv, "One Click Checkup", sAllPrefixUrl+"/checkup.php");
			
		oContentDiv = this.pr__add_expansion(poDiv, "Dashboards");
			this.pr__add_to_expansion(oContentDiv, "Launch", sHome +"/pages/dash/index.php");
			
		oContentDiv = this.pr__add_expansion(poDiv, "Agents");
			this.pr__add_to_expansion(oContentDiv, "Installed", sAllPrefixUrl+"/allagentversions.php");
			this.pr__add_to_expansion(oContentDiv, "Downloads", sAllPrefixUrl+"/appdversions.php");

		oContentDiv = this.pr__add_expansion(poDiv, "All");
			oParams = {};
			oParams[cMenus.METRIC_TYPE_QS] = cMenus.METRIC_TYPE_ACTIVITY;
			this.pr__add_to_expansion(oContentDiv, "Application Activity", cBrowser.buildUrl(sAllPrefixUrl+"/all.php", oParams));
			this.pr__add_to_expansion(oContentDiv, "Browser RUM Activity", cBrowser.buildUrl(sAllPrefixUrl+"/all.php", oParams));
			this.pr__add_to_expansion(oContentDiv, "Databases", sHome +"/pages/db/alldb.php");
			this.pr__add_to_expansion(oContentDiv, "Remote Services", sAllPrefixUrl+"/allbackends.php");
			this.pr__add_to_expansion(oContentDiv, "Synthetics", sAllPrefixUrl+"/allsynth.php");
			this.pr__add_to_expansion(oContentDiv, "Tiers", sAllPrefixUrl+"/alltier.php");
			
		oContentDiv = this.pr__add_expansion(poDiv, "Overviews");
			var sApp, sAppid;
			var iCount = 1;
			while (true){
				sApp = poDiv.attr("appname."+iCount);
				if (!sApp) break;
				sAppid = poDiv.attr("appid."+iCount);
				
				oParams = {};
				oParams[cMenus.APP_QS] = sApp;
				oParams[cMenus.APPID_QS] = sAppid;
				this.pr__add_to_expansion(oContentDiv, sApp, cBrowser.buildUrl(sAppPrefixUrl+"/tiers.php", oParams));
				iCount++;
			}
	}
}


//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
$.widget( "ck.appdmenu",{
	//#################################################################
	//# Definition
	//#################################################################
	options:{
		MenuType: null,
		AppName: null,
		AppID: null,
		TierName: null,
		TierID: null,
		home: "."
	},
	

	//#################################################################
	//# Constructor
	//#################################################################`
	_create: function(){
		var oThis, oOptions, oElement;
		
		//set basic stuff
		oThis = this;
		oElement = oThis.element;
		oElement.uniqueId();
		oElement.css({position:"relative"});
		
		var sElementName = oElement.get(0).tagName;
		if (sElementName !== "SELECT")	$.error("element must be a select");		
		//select menu doesnt automatically go to the top - dont forget to modify the CSS
		
		//check for necessary classes
		if (! oElement.selectmenu ) 	$.error("select Menu type missing! check includes");		
		if (!oElement.attr("menu")) 	$.error("select menu misssing menu attribute");				

		//get attributes
		var oOptions = this.options;
		oOptions.MenuType = oElement.attr("menu");
		oOptions.home = oElement.attr("home");
				
		//load content
		switch(oOptions.MenuType){
			case "appfunctions": 
				this.pr__showAppFunctions();
				break;
			case "appsmenu": 
				this.pr__showAppsMenu();
				break;
			case "appagents":
				this.pr__showAppAgentsMenu();
				break;
			case "tiermenu":
				this.pr__showTierMenu();
				break;
			case "tiernodesmenu":
				this.pr__showTierNodesMenu();
				break;
			case "tierfunctions":
				this.pr__showTierFunctions();
				break;
			default:
				$.error("unknown menu type: " + oOptions.MenuType);
		}
	},	
	
	//#################################################################
	//# show menus
	//#################################################################`
	pr__showAppFunctions: function(){
		var oOptions, oElement;
		var sAppname, sAppid;
		oOptions = this.options;
		oElement = this.element;
		
		//check for required options
		sAppname = oElement.attr("appname");
		if (!sAppname) {	$.error("appname attr missing!");	}
		sAppid = oElement.attr("appid");
		if (!sAppid)	{	$.error("appid attr missing!");		}
		
		//build the params
		var oParams = {};
		oParams[cMenus.APP_QS] = sAppname;
		oParams[cMenus.APPID_QS] = sAppid;
		
		
		//build the menu
		var sTransPrefixUrl = oOptions.home+"/pages/trans";
		var sAppPrefixUrl = oOptions.home+"/pages/app";
		var sSrvPrefixUrl = oOptions.home+"/pages/service";
		var sRumPrefixUrl = oOptions.home+"/pages/rum";
		
		var oSelect = oElement;
			//- - - - - - - - Application group
			var oGroup = $("<optgroup>",{label:"Application"});
				var oOption = $("<option>",{selected:1,disabled:1}).append(sAppname);
				oGroup.append(oOption);		
				
				this.pr__addToGroup(oGroup, "One Pager", cBrowser.buildUrl(sAppPrefixUrl+"/appoverview.php", oParams));
				
			oSelect.append(oGroup);
		
			//- - - - - - - - Application Functions group
			oGroup = $("<optgroup>",{label:"Show..."});
				this.pr__addToGroup(oGroup, "Activity (tiers)", cBrowser.buildUrl(sAppPrefixUrl+"/tiers.php", oParams));
				this.pr__addToGroup(oGroup, "Agents", cBrowser.buildUrl(sAppPrefixUrl+"/appagents.php", oParams));
				this.pr__addToGroup(oGroup, "Availability", cBrowser.buildUrl(sAppPrefixUrl+"/appavail.php", oParams));
				this.pr__addToGroup(oGroup, "Errors", cBrowser.buildUrl(sAppPrefixUrl+"/apperrors.php", oParams));
				this.pr__addToGroup(oGroup, "Events", cBrowser.buildUrl(sAppPrefixUrl+"/events.php", oParams));
				this.pr__addToGroup(oGroup, "External Calls", cBrowser.buildUrl(sAppPrefixUrl+"/appext.php", oParams));
				this.pr__addToGroup(oGroup, "Infrastructure", cBrowser.buildUrl(sAppPrefixUrl+"/appinfra.php", oParams));
				this.pr__addToGroup(oGroup, "Information Points", cBrowser.buildUrl(sAppPrefixUrl+"/appinfo.php", oParams));
				this.pr__addToGroup(oGroup, "Service End Points", cBrowser.buildUrl(sSrvPrefixUrl+"/services.php", oParams));
				this.pr__addToGroup(oGroup, "Transactions", cBrowser.buildUrl(sTransPrefixUrl+"/apptrans.php", oParams));
				oGroup2 = $("<optgroup>",{label:"Web Real User Monitoring"});
					this.pr__addToGroup(oGroup2, "Overall stats", cBrowser.buildUrl(sRumPrefixUrl+"/apprum.php", oParams));
					this.pr__addToGroup(oGroup2, "Page requests", cBrowser.buildUrl(sRumPrefixUrl+"/rumstats.php", oParams));
					this.pr__addToGroup(oGroup2, "Errors", cBrowser.buildUrl(sRumPrefixUrl+"/rumerrors.php", oParams));
				oGroup.append(oGroup2);
				oGroup3 = $("<optgroup>",{label:"Synthetics"});
					this.pr__addToGroup(oGroup3, "Overview", cBrowser.buildUrl(sRumPrefixUrl+"/synthetic.php", oParams));
				oGroup.append(oGroup3);
			oSelect.append(oGroup);
		
		//add and make the menu a selectmenu
		var oThis = this;		
		oSelect.selectmenu({select:	function(poEvent, poTarget){oThis.onSelectItem(poTarget.item.element)}}	);
	},

	
	//****************************************************************
	pr__showAppAgentsMenu: function(){
		var oElement = this.element;
		var oOptions = this.options;
		
		//check for required options
		var sAppname = oElement.attr("appname");
		if (!sAppname) {	$.error("appname attr missing!");	}
		var sAppid = oElement.attr("appid");
		if (!sAppid)	{	$.error("appid attr missing!");		}

		//build the params
		var sAppPrefixUrl = oOptions.home+"/pages/app";
		cJquery.setTopZindex(oElement);

		//build the select menu
		var oSelect = oElement;
			var oOption = $("<option>",{selected:1,disabled:1}).append("Show Agent...");
			oSelect.append(oOption);

			var oParams = {};
			oParams[cMenus.APP_QS] = sAppname;
			oParams[cMenus.APPID_QS] = sAppid;
			this.pr__addToGroup(oSelect, "Agent Information", cBrowser.buildUrl(sAppPrefixUrl+"/appagents.php", oParams));

			oParams[cMenus.METRIC_TYPE_QS] = cMenus.METRIC_TYPE_INFR_AVAIL;
			this.pr__addToGroup(oSelect, "Agent Availability", cBrowser.buildUrl(sAppPrefixUrl+"/appagentdetail.php", oParams));
			
			
			
			//<option value="<?=$sAgentStatsUrl?>">Activity</option>
		
		//add and make the menu a selectmenu
		var oThis = this;		
		oSelect.selectmenu({select:	function(poEvent, poTarget){oThis.onSelectItem(poTarget.item.element)}}	);		
	},
	
	
	//****************************************************************
	pr__showTierNodesMenu: function(){
		var oOptions, oElement;
		oOptions = this.options;
		oElement = this.element;
		var sThisBaseUrl = this.pr__get_base_tier_QS(oElement.attr("url"));

		cJquery.setTopZindex(oElement);

		//
		var oSelect = oElement
			var oOption = $("<option>",{selected:1,disabled:1}).append(oElement.attr("caption"));
			oSelect.append(oOption);
			
			var iCount = 1;
			while(true){
				var sNode = oElement.attr("node."+iCount);
				if (!sNode) break;
				
				var oParams = {};
				oParams[cMenus.NODE_QS] = sNode;
				this.pr__addToGroup(oSelect, sNode, cBrowser.buildUrl(sThisBaseUrl, oParams));
				iCount++;
			}

		//add and make the menu a selectmenu
		var oThis = this;		
		oSelect.selectmenu({select:	function(poEvent, poTarget){oThis.onSelectItem(poTarget.item.element)}}	);
	},
	
	//****************************************************************
	pr__showAppsMenu: function(){
		var oOptions, oElement;
		oOptions = this.options;
		oElement = this.element;
		
		var sThisID = cBrowser.data[cMenus.APPID_QS];
		var sUrl = oElement.attr("url") + oElement.attr("extra");
		cJquery.setTopZindex(oElement);
		
		var oSelect = oElement;
			var oOption = $("<option>",{selected:1,disabled:1}).append(oElement.attr("caption"));
			oSelect.append(oOption);

			var sApp, sAppid, oParams, oOption;
			var iCount = 1;
			
			while (true){
				sApp = oElement.attr("appname."+iCount);
				if (!sApp) break;
				sAppid = oElement.attr("appid."+iCount);
				
				oParams = {};
				oParams[cMenus.APP_QS] = sApp;
				oParams[cMenus.APPID_QS] = sAppid;
					
				oOption = this.pr__addToGroup(oSelect, sApp, cBrowser.buildUrl(sUrl, oParams));
				if (sAppid == sThisID)	oOption.attr("disabled",1);
				iCount++;
			}
		//add and make the menu a selectmenu
		var oThis = this;		
		oSelect.selectmenu({select:	function(poEvent, poTarget){oThis.onSelectItem(poTarget.item.element)}}	);
	},
	
	//****************************************************************
	pr__showTierMenu: function(){
		var oOptions, oElement;
		oOptions = this.options;
		oElement = this.element;
		
		var sThisTierID = cBrowser.data[cMenus.TIER_ID_QS];
		var sUrl = oElement.attr("url")+ oElement.attr("extra");
		var sBaseUrl = this.pr__get_base_app_QS(sUrl);
		var sCaption = oElement.attr("caption");
		
		cJquery.setTopZindex(oElement);
		//build the select
		var oSelect = oElement;
			var oOption = $("<option>",{selected:1,disabled:1}).append(sCaption);
			oSelect.append(oOption);
			var iCount = 1;
			while (true){
				sTier = oElement.attr("tname."+iCount);
				if (!sTier) break;
				sTid = oElement.attr("tid."+iCount);

				var oParams = {};
				oParams[cMenus.TIER_QS] = sTier;
				oParams[cMenus.TIER_ID_QS] = sTid;
				var sOptUrl = cBrowser.buildUrl(sBaseUrl,oParams);
				
				var oOption = this.pr__addToGroup(oSelect, sTier, sOptUrl);
				if (sTid == sThisTierID) oOption.disabled = true;
				
				iCount++;
			}

		//add and make the menu a selectmenu
		var oThis = this;		
		oSelect.selectmenu({select:	function(poEvent, poTarget){oThis.onSelectItem(poTarget.item.element)}}	);
	},
	
	//****************************************************************
	pr__showTierFunctions: function(){
		var oOptions, oElement;
		oOptions = this.options;
		oElement = this.element;
		
		var sApp = cBrowser.data[cMenus.APP_QS];
		var sThisTier = cBrowser.data[cMenus.TIER_QS];
		var sTier = oElement.attr("tier");
		if (!sTier) sTier = sThisTier;
		
		var sTierPrefixUrl = oOptions.home+"/pages/tier";
		var sAppPrefixUrl = oOptions.home+"/pages/app";
		var sSrvPrefixUrl = oOptions.home+"/pages/service";
		var sTransPrefixUrl = oOptions.home+"/pages/trans";

		cJquery.setTopZindex(oElement);

		var oSelect = oElement;
			//--------------------------------------------------------------------
			var oOption = $("<option>",{selected:1,disabled:1}).append(sTier);
			oSelect.append(oOption);
			
			this.pr__addToGroup(oSelect, "Overview", this.pr__get_base_tier_QS(sTierPrefixUrl+"/tier.php"));
			if (sThisTier)
				this.pr__addToGroup(oSelect, "Back to ("+sApp+")", this.pr__get_base_app_QS(sAppPrefixUrl+"/tiers.php"));
						
			//--------------------------------------------------------------------
			this.pr__addToGroup(oSelect, "Errors", this.pr__get_base_tier_QS(sTierPrefixUrl+"/tiererrors.php"));
			this.pr__addToGroup(oSelect, "External Calls (graph)", this.pr__get_base_tier_QS(sTierPrefixUrl+"/tierextgraph.php"));
			this.pr__addToGroup(oSelect, "External Calls (table)", this.pr__get_base_tier_QS(sTierPrefixUrl+"/tierextcalls.php"));
			this.pr__addToGroup(oSelect, "Infrastructure", this.pr__get_base_tier_QS(sTierPrefixUrl+"/tierinfrstats.php"));
			this.pr__addToGroup(oSelect, "Service End Points", this.pr__get_base_tier_QS(sSrvPrefixUrl+"/services.php"));
			this.pr__addToGroup(oSelect, "Transactions", this.pr__get_base_tier_QS(sTransPrefixUrl+"/apptrans.php"));

		//add and make the menu a selectmenu
		var oThis = this;		
		oSelect.selectmenu({select:	function(poEvent, poTarget){oThis.onSelectItem(poTarget.item.element)}}	);
	},
	
	//#################################################################
	//# privates 
	//#################################################################`
	pr__addToGroup: function(poGroup, psLabel, psUrl){
		var oOption = $("<option>",{value:psUrl}).append(psLabel);			
		poGroup.append(oOption);
		return oOption;
	},
	
	//****************************************************************
	pr__get_base_tier_QS: function(psBaseUrl){
		oElement = this.element;
		var oParams = {};
		
		oParams[cMenus.APP_QS]= cBrowser.data[cMenus.APP_QS];
		oParams[cMenus.APPID_QS]= cBrowser.data[cMenus.APPID_QS];
		
		var sTier, sTid, sNode;
		sTier = oElement.attr("tier");
		sTid = oElement.attr("tid");
		sNode = oElement.attr("node");
		if (!sNode) sNode = cBrowser.data[cMenus.NODE_QS];
		
		oParams[cMenus.TIER_ID_QS]= (sTid?sTid:cBrowser.data[cMenus.TIER_ID_QS]);
		oParams[cMenus.TIER_QS]= (sTier?sTier:cBrowser.data[cMenus.TIER_QS]);
		if (sNode)	oParams[cMenus.NODE_QS]= sNode;
		
		return cBrowser.buildUrl(psBaseUrl,oParams);
	},
	
	//****************************************************************
	pr__get_base_app_QS: function(psBaseUrl){
		var oParams = {};
		oParams[cMenus.APP_QS]= cBrowser.data[cMenus.APP_QS];
		oParams[cMenus.APPID_QS]= cBrowser.data[cMenus.APPID_QS];
		
		return cBrowser.buildUrl(psBaseUrl,oParams);
	},
	
	//#################################################################
	//# events
	//#################################################################`
	onSelectItem: function(poTarget){
		var sUrl = poTarget.attr("value");
		if (sUrl)	document.location.href = sUrl;
	}
});