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
$home="../..";
require_once "$home/inc/common.php";
require_once "$root/inc/inc-charts.php";


//####################################################################
cRenderHtml::header("tier disks");
cChart::do_header();
cRender::force_login();

//get passed in values
$oTier = cRenderObjs::get_current_tier();
$oApp = $oTier->app;
$sTierQS = cRenderQS::get_base_tier_QS($oTier);
$sNode = cHeader::get(cRender::NODE_QS);

// show time options
$title = "$oApp->name&gt;$oTier->name&gt;Tier Infrastructure&gt;disks";
cRender::show_time_options($title); 
$showlink = cCommon::get_session($LINK_SESS_KEY);

//other buttons
$oCred = cRenderObjs::get_appd_credentials();
if (!$oCred->restricted_login) cRenderMenus::show_tier_functions();

//********************************************************************
if (cAppdyn::is_demo()){
	cRender::errorbox("function not support ed for Demo");
	cRenderHtml::footer();
	exit;
}
//********************************************************************


//data for the page
	
//####################################################################
?>
<h2>Overall Disks Metrics for <?=cRender::show_name(cRender::NAME_TIER,$oTier)?></h2>
<?php
	$aData = $oTier->GET_DiskMetrics();
	$sBaseMetric = cAppdynMetric::InfrastructureNodeDisks($oTier->name);
	$aMetrics = [];
	foreach ($aData as $oMetric)
		$aMetrics[]= [cChart::LABEL=>$oMetric->name, cChart::METRIC=>$oMetric->name];
	cChart::render_metrics($oApp, $aMetrics, cChart::CHART_WIDTH_LETTERBOX/3);

?>
<h2>disks for Node..<?=cRender::show_name(cRender::NAME_OTHER,$sNode)?></h2>
<?php
	$sBaseMetric = cAppDynMetric::InfrastructureNodeDisks($oTier->name, $sNode);
	$aData = $oTier->GET_NodeDisks($sNode);
	$aMetrics = [];
	foreach ($aData as $oDisk){
		$aMetrics[]= [cChart::LABEL=>$oDisk->name, cChart::TYPE=>cChart::LABEL, cChart::WIDTH=>250];

		$sMetric = cAppdynMetric::InfrastructureNodeDiskFree($oTier->name, $sNode, $oDisk->name);
		$aMetrics[]= [cChart::LABEL=>$oDisk->name." free", cChart::METRIC=>$oMetric->name];
		$sMetric = cAppdynMetric::InfrastructureNodeDiskUsed($oTier->name, $sNode, $oDisk->name);
		$aMetrics[]= [cChart::LABEL=>$oDisk->name." used", cChart::METRIC=>$oMetric->name];
	}
	cChart::metrics_table($oApp, $aMetrics, 3, cRender::getRowClass());
?>
<?php
cChart::do_footer();
cRenderHtml::footer();
?>
