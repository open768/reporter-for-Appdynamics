<?php

/**************************************************************************
Copyright (C) Chicken Katsu 2013-2018 

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
require_once("$phpinc/ckinc/header.php");
require_once("$phpinc/ckinc/http.php");
	
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
$gsAppQS = cRender::get_base_app_QS();
$oApp = cRender::get_current_app();
$sGraphUrl = cHttp::build_url("rumstats.php", $gsAppQS);

//####################################################################
cRender::html_header("Web browser - Real user monitoring - graphs");
cChart::do_header();

cRender::force_login();
$title ="$app&gtWeb Real User Monitoring Stats";
cRender::show_time_options( $title); 
cRenderMenus::show_apps_menu("Show Stats for:", "rumstats.php");
$oTimes = cRender::get_times();
cRender::button("Statistics", $sGraphUrl);	

//#############################################################
function sort_metric_names($poRow1, $poRow2){
	return strnatcasecmp($poRow1->metricPath, $poRow2->metricPath);
}

$gsTABLE_ID = 0;

//*****************************************************************************
function render_graphs($psType, $paData){
	global $oApp, $gsAppQS;
	
	uasort ($paData, "sort_metric_names");
	$aMetrics = [];
	
	$sBaseQS = cHttp::build_QS($gsAppQS, cRender::RUM_TYPE_QS,$psType);
				
	foreach ($paData as $oItem){
		if ($oItem == null ) continue;
		if ($oItem->metricValues == null ) continue;
		
		$oValues = $oItem->metricValues[0];
		if ($oValues->count == 0 ) continue;

		$sName = cAppDynUtil::extract_RUM_name($psType, $oItem->metricPath);
		$sDetailQS = cHttp::build_QS($sBaseQS, cRender::RUM_PAGE_QS,$sName);
		$sUrl = "rumpage.php?$sDetailQS";

		$aMetrics[] = [
			cChart::LABEL=>$sName ." Response times (ms)", cChart::METRIC=>$oItem->metricPath,
			cChart::GO_URL=>$sUrl, cChart::GO_HINT=>"See details" 
		];

	}
	cChart::metrics_table($oApp, $aMetrics,2);
}

//********************************************************************
if (cAppdyn::is_demo()){
	cRender::errorbox("function not support ed for Demo");
	cRender::html_footer();
	exit;
}
//********************************************************************


//#############################################################
//get the page metrics
?>
<h2>Page Requests</h2>
<?php
	$sMetricpath = cAppdynMetric::webrumPageResponseTimes(cAppdynMetric::BASE_PAGES, "*");
	$aData = cAppdynCore::GET_MetricData($app, $sMetricpath, $oTimes,"true",false,true);
	render_graphs(cAppdynMetric::BASE_PAGES, $aData);
	
// ############################################################
?>
<h2>Ajax Requests</h2>
<?php
	$sMetricpath = cAppdynMetric::webrumPageResponseTimes(cAppdynMetric::AJAX_REQ, "*");
	$aData = cAppdynCore::GET_MetricData($app, $sMetricpath, $oTimes,"true",false,true);
	render_graphs(cAppdynMetric::AJAX_REQ, $aData);

	// ############################################################
cChart::do_footer();
cRender::html_footer();
?>