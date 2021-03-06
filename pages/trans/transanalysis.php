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
//####################################################################
$home="../..";
require_once "$home/inc/common.php";
require_once "$root/inc/inc-charts.php";

require_once("$root/inc/inc-filter.php");

const HOWMANY=10;

//####################################################################
cRenderHtml::header("top ".HOWMANY." slowest Transactions analysis");
cRender::force_login();
cChart::do_header();

//####################################################
//display the results
$oTier = cRenderObjs::get_current_tier();
$oApp = $oTier->app;
$trans = cHeader::get(cRender::TRANS_QS);
$trid = cHeader::get(cRender::TRANS_ID_QS);

$sTierQS = cRenderQS::get_base_tier_QS($oTier);
$sTransQS = cHttp::build_QS($sTierQS, cRender::TRANS_QS,$trans);
$sTransQS = cHttp::build_QS($sTransQS, cRender::TRANS_ID_QS,$trid);

$oTimes = cRender::get_times();


cRender::show_time_options("$oApp->name&gt;$oApp->name&gt;$oTier->name&gt;$trans"); 
//********************************************************************
if (cAppdyn::is_demo()){
	cRender::errorbox("function not support ed for Demo");
	cRenderHtml::footer();
	exit;
}
//#####################################################################
function sort_time($a, $b){
	return (($a->timeTakenInMilliSecs<$b->timeTakenInMilliSecs?1:-1));
}

//*********************************************************************
function analyse_snapshot($poSnapshot){
	global $oTable;
	
	$oExtCalls = cAppDynUtil::count_snapshot_ext_calls($poSnapshot);
	if ($oExtCalls == null) return null;
	
	$oTable->add_col_data($poSnapshot->requestGUID, $oExtCalls);
	$oTable->set_col_info($poSnapshot->requestGUID, $poSnapshot);
}

//#####################################################################
cRenderMenus::show_tier_functions();
cRender::appdButton(cAppDynControllerUI::transaction($oApp,$trid));
cRender::button("back to Transaction details", "transdetails.php?$sTransQS");
cDebug::flush();

$oTable = new c2DArray;


//#####################################################################
?>
<h1><?=cRender::show_name(cRender::NAME_TRANS,$trans)?></h1>
<h2><a name="5">Top <?=HOWMANY?> slowest Transaction Snapshots</a></h2>
<?php
$bProceed = true;
$aSnapshots = $oApp->GET_snaphot_info($trid, $oTimes);
if (count($aSnapshots) == 0){
	?><div class="maintable">No Snapshots found</div><?php
	$bProceed = false;
}

//#####################################################################
if ($bProceed){
	//get the top ten slowest
	uasort($aSnapshots , "sort_time");	
	$aTopTen = [];
	foreach ($aSnapshots as $oSnapshot){
		if (count($aTopTen) >=HOWMANY) break;				
		$aTopTen[] = $oSnapshot;
	}
	?>
	<table class="maintable" id="trans" class="<?=cRender::getRowClass()?>">
		<thead><tr class="tableheader">
			<th width="140">start time</th>
			<th width="10"></th>
			<th width="80">Duration</th>
			<th>Server</th>
			<th>URL</th>
			<th>Summary</th>
			<th width="80"></th>
		</tr></thead>
		<tbody><?php
			foreach ($aTopTen as $oSnapshot){
				$iEpoch = (int) ($oSnapshot->serverStartTime/1000);
				$sDate = date(cCommon::ENGLISH_DATE_FORMAT, $iEpoch);

				$sOriginalUrl = $oSnapshot->URL;
				if ($sOriginalUrl === "") $sOriginalUrl = $trans;
				
				$sAppdUrl = cAppDynControllerUI::snapshot($oApp, $trid, $oSnapshot->requestGUID, $oTimes);
				$sImgUrl = cRender::get_trans_speed_colour($oSnapshot->timeTakenInMilliSecs);
				$sSnapQS = cHttp::build_QS($sTransQS, cRender::SNAP_GUID_QS, $oSnapshot->requestGUID);
				$sSnapQS = cHttp::build_QS($sSnapQS, cRender::SNAP_URL_QS, $sOriginalUrl);
				$sSnapQS = cHttp::build_QS($sSnapQS, cRender::SNAP_TIME_QS, $oSnapshot->serverStartTime);
				
				?>
				<tr>
					<td><?=$sDate?></td>
					<td><img src="<?=$home?>/<?=$sImgUrl?>"></td>
					<td align="middle"><?=$oSnapshot->timeTakenInMilliSecs?></td>
					<td><?=cAppdynUtil::get_node_name($oApp,$oSnapshot->applicationComponentNodeId)?></td>
					<td><div style="max-width:200px;overflow-wrap:break-word;">
						<a href="snapdetails.php?<?=$sSnapQS?>" target="_blank"><?=$sOriginalUrl?></a>
					</div></td>
					<td><?=cCommon::fixed_width_div(600, $oSnapshot->summary)?></div></td>
					<td><?=cRender::appdButton($sAppdUrl, "Go")?></td>
				</tr>
			<?php }
		?></tbody>
	</table>
	<script language="javascript">
		$( function(){ 
			$("#trans").tablesorter({
				headers:{
					3:{ sorter: 'digit' }
				}
			});
		});

	</script>
	<?php
}

//#####################################################################
if ($bProceed){
	?>
	<h2>Analysis of Transactions External Calls</h2>
	<div ID="progress"><?php
		$i=0;
		foreach ($aTopTen as $oSnapshot){
			echo "analysing Snaphot $oSnapshot->URL with $oSnapshot->timeTakenInMilliSecs ms elapsed... ";
			cDebug::flush();

			analyse_snapshot($oSnapshot);

			echo "Done<br>";
			cDebug::flush();
		}
		echo "Analysis Complete";
	?></div>
	<script language="javascript">$(function(){ $("#progress").hide()});</script>
	
	<table border="1" cellpadding="2" cellspacing="0" class="<?=cRender::getRowClass()?>">
		<thead><tr>
			<td>url</td>
			<td>start time</td>
			<td><?=cCommon::fixed_width_div(50,"total elapsed time")?></td><?php
			$aExtCalls = $oTable->rowNames();
			foreach ($aExtCalls as $sExtName){	?><th><?=cCommon::fixed_width_div(100,$sExtName)?></th><?php	}
		?></tr></thead><?php
			
		$aSnaphots = $oTable->colNames();
		foreach ($aSnaphots as $sSnapshot){
			?><tr><?php
				$iEpoch = (int) ($oSnapshot->serverStartTime/1000);
				$sDate = date(cCommon::ENGLISH_DATE_FORMAT, $iEpoch);
				
				
				$sOriginalUrl = $oSnapshot->URL;
				if ($sOriginalUrl === "") $sOriginalUrl = $trans;

				$oSnapshot = $oTable->get_col_info($sSnapshot);
				$sSnapQS = cHttp::build_QS($sTransQS, cRender::SNAP_GUID_QS, $oSnapshot->requestGUID);
				$sSnapQS = cHttp::build_QS($sSnapQS, cRender::SNAP_URL_QS, $sOriginalUrl);
				$sSnapQS = cHttp::build_QS($sSnapQS, cRender::SNAP_TIME_QS, $oSnapshot->serverStartTime);
				?><td><div style="max-width:200px;overflow-wrap:break-word;">
					<a href="snapdetails.php?<?=$sSnapQS?>" target="_blank"><?=$sOriginalUrl?></a>
				</div></td>
				<td><?=$sDate?></td>
				<td><?=$oSnapshot->timeTakenInMilliSecs?>ms</td><?php
				
				foreach ($aExtCalls as $sExtName){
					$oData = $oTable->get($sExtName, $sSnapshot);
					?><td align="middle"><?php
						if ($oData !== null) echo $oData->count;
					?></td><?php
				}
			?></tr><?php
		}
	?></table><?php
		
}


// ################################################################################
// ################################################################################
cChart::do_footer();

cRenderHtml::footer();
?>