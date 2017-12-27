<?php

/**************************************************************************
Copyright (C) Chicken Katsu 2013-2016 

This code is protected by copyright under the terms of the 
Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License
http://creativecommons.org/licenses/by-nc-nd/4.0/legalcode

For licenses that allow for commercial use please contact cluck@chickenkatsu.co.uk

// USE AT YOUR OWN RISK - NO GUARANTEES OR ANY FORM ARE EITHER EXPRESSED OR IMPLIED
**************************************************************************/

//####################################################################
$root=realpath(".");
$phpinc = realpath("$root/../phpinc");
$jsinc = "../jsinc";

require_once("$phpinc/ckinc/debug.php");
require_once("$phpinc/ckinc/session.php");
require_once("$phpinc/ckinc/common.php");
require_once("$phpinc/ckinc/http.php");
require_once("$phpinc/ckinc/header.php");
	
cSession::set_folder();
session_start();
cDebug::check_GET_or_POST();

//####################################################################
require_once("$phpinc/appdynamics/appdynamics.php");
require_once("$phpinc/appdynamics/common.php");
require_once("inc/inc-charts.php");
require_once("inc/inc-secret.php");
require_once("inc/inc-render.php");


//-----------------------------------------------
$app = cHeader::get(cRender::APP_QS);
$aid = cHeader::get(cRender::APP_ID_QS);
$oApp = cRender::get_current_app();
//####################################################################
cRender::html_header("Tiers in Application $app");
cRender::force_login();
?>
	<script type="text/javascript" src="js/remote.js"></script>
	
<?php
cChart::do_header();
cRender::show_time_options( $app); 


//####################################################################
cRenderMenus::show_apps_menu("Show Tier Activity for:","tiers.php");
$sAppQS = cRender::get_base_app_QS();

cRender::appdButton(cAppDynControllerUI::application($aid));

//####################################################################
?>
<h2>Overall Activity in <?=$app?></h2>
<?php
$aMetrics = [];
$aMetrics[] = [cChart::LABEL=>"Overall Calls per min",cChart::METRIC=>cAppDynMetric::appCallsPerMin()];
$aMetrics[] = [cChart::LABEL=>"Overall response time in ms", cChart::METRIC=>cAppDynMetric::appResponseTimes()];
cChart::metrics_table($oApp, $aMetrics,2,cRender::getRowClass());			
?>
<p>

<h2>Tiers Activity in application (<?=$app?>)</h2>
<?php
//-----------------------------------------------
$oResponse =cAppdyn::GET_Tiers($app);
foreach ( $oResponse as $oTier){
	?><div class="cRender::getRowClass()"><?php
		$sTier=$oTier->name;
		if (cFilter::isTierFilteredOut($sTier)) continue;
		
		cRenderMenus::show_tier_functions($sTier, $oTier->id);
		$aMetrics = [];
		$aMetrics[] = [cChart::LABEL=>"Calls per min",cChart::METRIC=>cAppDynMetric::tierCallsPerMin($sTier)];
		$aMetrics[] = [cChart::LABEL=>"Response time in ms", cChart::METRIC=>cAppDynMetric::tierResponseTimes($sTier)];
		cChart::metrics_table($oApp, $aMetrics,2,null);			
	?></div><?php
}
cChart::do_footer();

cRender::html_footer();
?>
