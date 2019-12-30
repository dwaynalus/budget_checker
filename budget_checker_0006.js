//THIS IS A GOOGLE ADS SCRIPT.
//THIS SCRIPT WILL CREATE ITS OWN LABELS.
//THIS SCRIPT WILL LABEL ANY CURRENTLY RUNNING CAMPAIGNS, THIS EXCLUDES EXPERIMENTS.
//IF A CAMPAIGN IS PAUSED MANUALLY AND IT IS STILL LABELED AS RUNNING THIS SCRIPT WILL UNPAUSE IT, AND SEND AN EMAIL.
//THIS SCRIPT WILL PAUSE AND LABEL ANY RUNNING CAMPAIGNS IF OVER COST, AND AUTOMATICALLY RESTART LABELED CAMPAIGNS IF UNDER COST (LIKE THE START OF THE NEW MONTH), THIS EXCLUDES EXPERIMENTS.
//THIS SCRIPT WILL ONLY SEND AN EMAIL IF IT CHANGES ANYTHING, WITH LOGS.
//THIS IS FREE FOR YOU TO USE, BUT YOU MUST GIVE ME CREDIT FOR MY WORK AND INCLUDE THIS HEADER.
//IF YOU FIND THIS USEFUL YOU CAN BUY ME A DRINK OR THREE AT HTTPS://paypal.me/dwaynalus
//CODED BY DWAYNE THOMAS.
//
//PAUSE WHEN OVER THIS COST.
var PAUSE_COST = 100;
//THE ACCOUNT MANAGER AND EMERGENCY EMAIL RECIPIENT. INSIDE SINGLE QUOTES.
var accountManager = 'your@emailhere';
var supportEmail = 'yourother@emailhere';
//DO NOT EDIT BELOW.
var SEARCH_PAUSE = "SEARCH_PAUSED";
var VIDEO_PAUSE = "VIDEO_PAUSED";
var SHOP_PAUSE = "SHOP_PAUSED";
var RUNNING = "RUNNING";
var version = 06;
var thisAccount = AdWordsApp.currentAccount();
var accountName = AdWordsApp.currentAccount().getName();
var currentCost = AdWordsApp.currentAccount().getStatsFor("THIS_MONTH").getCost();
var changes = 0;

function main() {
	//THIS PART RUNS EVERY HOUR.
	logBootup();
	//IF LABELS DO NOT EXIST THEN CREATE THEM.
	createLabels();
	//APPLY LABELS TO ALL CURRENTLY RUNNING SEARCH, DISPLAY, VIDEO CAMPAIGNS.
	labelRunningCampaigns();
	//THIS PART RUNS IF COST IS GREATER THAN PAUSE_COST.
	if (currentCost > PAUSE_COST) {
	pauseVideoCampaigns();
	pauseCampaigns();
	pauseShopCampaigns();
		//SKIP EMAILS UNLESS SOMETHING CHANGES.
		if (changes > 0){
		emailAMPause();
		emailSupportPause();
		}else{
		Logger.log('No Changes<br />');	
		}
	}
	//THIS PART RUNS IF COST IS LESS THAN PAUSE_COST. LIKE AT THE START OF MONTH.
	if (currentCost < PAUSE_COST) {
	enableVideoCampaigns();
	enableCampaigns();
	enableShopCampaigns();
	enableRunning();
	enableRunningVideo();
	enableRunningShop();
		//SKIP EMAILS UNLESS SOMETHING CHANGES.
		if (changes > 0){
		emailAMEnable();
		emailSupportEnable();
		}else{
		Logger.log('No Changes<br />');	
		}
	}
}

function logBootup() {
	//WHATEVER WE WANT TO LOG EVERY HOUR. ALSO AT TOP OF EMAILS THAT INCLUDE LOGS.
	Logger.log('Loading Budget Script Version:' + version +'<br />Account:' + accountName + '<br />AccountManager: ' + accountManager + '<br />Current Monthly Cost:' + currentCost + '<br />');
}

function enableRunning(){
	//Logger.log('ENABLING RUNNING SEARCH AND DISPLAY<br />');
	var campaignIterator = AdWordsApp.campaigns()
	.withCondition("LabelNames CONTAINS_ANY ['" + RUNNING + "']")
    .withCondition("Status = PAUSED")
	.get();
	while (campaignIterator.hasNext()) {
		changes += 1;
		var campaign = campaignIterator.next();
		Logger.log(campaign.getName() + ': ENABLED BY BUDGET SCRIPT<br />');
		campaign.enable();
	}	
}

function enableRunningShop(){
	//Logger.log('ENABLING RUNNING SHOPPING<br />');
	var shopCampaignIterator = AdWordsApp.shoppingCampaigns()
	.withCondition("LabelNames CONTAINS_ANY ['" + RUNNING + "']")
    .withCondition("Status = PAUSED")
	.get();
	while (shopCampaignIterator.hasNext()) {
		changes += 1;
		var shopCampaign = shopCampaignIterator.next();
		Logger.log(shopCampaign.getName() + ': ENABLED BY BUDGET SCRIPT<br />');
		shopCampaign.enable();
  }	
}

function enableRunningVideo(){
	//Logger.log('ENABLING RUNNING VIDEO<br />');
	var videoCampaignIterator = AdWordsApp.videoCampaigns()
	.withCondition("LabelNames CONTAINS_ANY ['" + RUNNING + "']")
    .withCondition("Status = PAUSED")
	.get();
	while (videoCampaignIterator.hasNext()) {
		changes += 1;
		var videoCampaign = videoCampaignIterator.next();
		Logger.log(videoCampaign.getName() + ': ENABLED BY BUDGET SCRIPT<br />');
		videoCampaign.enable();
  }	
}

function pauseCampaigns() {
	//Logger.log('PAUSING SEARCH AND DISPLAY<br />');
	var campaignIterator = AdWordsApp.campaigns()
	.withCondition("LabelNames CONTAINS_ANY ['" + RUNNING + "']")
	.get();
	while (campaignIterator.hasNext()) {
		changes += 1;
		var campaign = campaignIterator.next();
		Logger.log(campaign.getName() + ': PAUSED BY BUDGET SCRIPT<br />');
		campaign.applyLabel(SEARCH_PAUSE);
		campaign.removeLabel(RUNNING);
		campaign.pause();
	}
}

function pauseVideoCampaigns() {
	//Logger.log('PAUSING VIDEO CAMPAIGNS<br />');
	var videoCampaignIterator = AdWordsApp.videoCampaigns()
	.withCondition("LabelNames CONTAINS_ANY ['" + RUNNING + "']")
	.get();
	while (videoCampaignIterator.hasNext()) {
		changes += 1;
		var videoCampaign = videoCampaignIterator.next();
		Logger.log(videoCampaign.getName() + ': PAUSED BY BUDGET SCRIPT<br />');
		videoCampaign.applyLabel(VIDEO_PAUSE);
		videoCampaign.removeLabel(RUNNING);
		videoCampaign.pause();
  }
}

function pauseShopCampaigns() {
	//Logger.log('ENABLING SHOPPING<br />');
	var shopCampaignIterator = AdWordsApp.shoppingCampaigns()
	.withCondition("LabelNames CONTAINS_ANY ['" + SHOP_PAUSE + "']")
	.get();
	while (shopCampaignIterator.hasNext()) {
		changes += 1;
		var shopCampaign = shopCampaignIterator.next();
		Logger.log(shopCampaign.getName() + ': PAUSED BY BUDGET SCRIPT<br />');
		shopCampaign.pause();
		shopCampaign.removeLabel(SHOP_PAUSE);
  }
}

function enableCampaigns() {
	//Logger.log('ENABLING SEARCH AND DISPLAY<br />');
	var campaignIterator = AdWordsApp.campaigns()
	.withCondition("LabelNames CONTAINS_ANY ['" + SEARCH_PAUSE + "']")
	.get();
	while (campaignIterator.hasNext()) {
		changes += 1;
		var campaign = campaignIterator.next();
		Logger.log(campaign.getName() + ': ENABLED BY BUDGET SCRIPT<br />');
		campaign.enable();
		campaign.removeLabel(SEARCH_PAUSE);
	}
}

function enableVideoCampaigns() {
	//Logger.log('ENABLING VIDEO<br />');
	var videoCampaignIterator = AdWordsApp.videoCampaigns()
	.withCondition("LabelNames CONTAINS_ANY ['" + VIDEO_PAUSE + "']")
	.get();
	while (videoCampaignIterator.hasNext()) {
		changes += 1;
		var videoCampaign = videoCampaignIterator.next();
		Logger.log(videoCampaign.getName() + ': ENABLED BY BUDGET SCRIPT<br />');
		videoCampaign.enable();
		videoCampaign.removeLabel(VIDEO_PAUSE);
  }
}

function enableShopCampaigns() {
	//Logger.log('ENABLING SHOPPING<br />');
	var shopCampaignIterator = AdWordsApp.shoppingCampaigns()
	.withCondition("LabelNames CONTAINS_ANY ['" + SHOP_PAUSE + "']")
	.get();
	while (shopCampaignIterator.hasNext()) {
		changes += 1;
		var shopCampaign = shopCampaignIterator.next();
		Logger.log(shopCampaign.getName() + ': ENABLED BY BUDGET SCRIPT<br />');
		shopCampaign.enable();
		shopCampaign.removeLabel(SHOP_PAUSE);
  }
}

function createLabels() {
	//Check if the label exists
	var labels = AdWordsApp.labels().withCondition("Name = '" + SEARCH_PAUSE + "'").get();
	if (labels.totalNumEntities() < 1) {
	//CREATE LABEL.
	AdWordsApp.createLabel(SEARCH_PAUSE, 'Created By Budget Checker Version ' + version, '#0FFF00');
	Logger.log(SEARCH_PAUSE + ': Label Created<br />');
	changes += 1;
	}
	//Check if the video label exists
	var vidlabels = AdWordsApp.labels().withCondition("Name = '" + VIDEO_PAUSE + "'").get();
	if (vidlabels.totalNumEntities() < 1) {
	//CREATE LABEL.
	AdWordsApp.createLabel(VIDEO_PAUSE, 'Created By Budget Checker Version ' + version, '#0FFF00');
	Logger.log(VIDEO_PAUSE + ': Label Created<br />');
	changes += 1;
	}
	var runLabels = AdWordsApp.labels().withCondition("Name = '" + RUNNING + "'").get();
	if (runLabels.totalNumEntities() < 1) {
	//CREATE LABEL.
	AdWordsApp.createLabel(RUNNING, 'Created By Budget Checker Version ' + version, '#00FF00');
	Logger.log(RUNNING + ': Label Created<br />');
	changes += 1;
	}
	var shopLabels = AdWordsApp.labels().withCondition("Name = '" + SHOP_PAUSE + "'").get();
	if (shopLabels.totalNumEntities() < 1) {
	//CREATE LABEL.
	AdWordsApp.createLabel(SHOP_PAUSE, 'Created By Budget Checker Version ' + version, '#00FF00');
	Logger.log(SHOP_PAUSE + ': Label Created<br />');
	changes += 1;
	}
}

function labelRunningCampaigns() {
	//Grab Enabled Campaigns. ADD MORE CONDITIONS IF NEEDED.
	//.withCondition("CampaignExperimentType = BASE") USE THIS TO IGNORE EXPERIMENTS AND DRAFTS.
	var campaignIterator = AdWordsApp.campaigns()
	.withCondition("LabelNames CONTAINS_NONE ['" + RUNNING + "']")
	.withCondition("Status = ENABLED")
	.withCondition("CampaignExperimentType = BASE")
	.get();
	//Grab Enabled VIDEO Campaigns. ADD MORE CONDITIONS IF NEEDED.
	var videoCampaignIterator = AdWordsApp.videoCampaigns()
	.withCondition("LabelNames CONTAINS_NONE ['" + RUNNING + "']")
	.withCondition("Status = ENABLED")
	.withCondition("CampaignExperimentType = BASE")
	.get();
	//Grab Enabled SHOPPING Campaigns. ADD MORE CONDITIONS IF NEEDED.
	var shopCampaignIterator = AdWordsApp.shoppingCampaigns()
	.withCondition("LabelNames CONTAINS_NONE ['" + RUNNING + "']")
	.withCondition("Status = ENABLED")
	.withCondition("CampaignExperimentType = BASE")
	.get();
	//Label Campaigns.
	while(campaignIterator.hasNext()){
		var campaign = campaignIterator.next();
		campaign.applyLabel(RUNNING);
		Logger.log(campaign.getName() + ': RUNNING LABEL Added By Budget Checker Version ' + version + '<br />');
		changes += 1;
	}
	//Label YouTube Campaigns.
	while(videoCampaignIterator.hasNext())
	{
		var videoCampaign = videoCampaignIterator.next();
		videoCampaign.applyLabel(RUNNING);
		Logger.log(videoCampaign.getName() + ': RUNNING LABEL Added By Budget Checker Version ' + version + '<br />');
		changes += 1;
	}
	//Label Shopping Campaigns.
	while(shopCampaignIterator.hasNext())
	{
		var shopCampaign = shopCampaignIterator.next();
		shopCampaign.applyLabel(RUNNING);
		Logger.log(shopCampaign.getName() + ': RUNNING LABEL Added By Budget Checker Version ' + version + '<br />');
		changes += 1;
	}
}

function emailSupportPause() {
	//EMAIL SUPPORT.
	MailApp.sendEmail({
	to:supportEmail,
	subject:accountName + ' Monthly Budget Reached.',
	htmlBody:'<!DOCTYPE html><html><body><b>Have paused Campaigns as Monthly spend of '+ PAUSE_COST +' has been spent. Advise '+ accountManager +' that monthly limit has been reached.<br />' + Logger.getLog() + '<b/></body></html>'
	});
	//LOG EMAIL SENT.
	Logger.log('PAUSE Email Sent To Support<br />');
}

function emailAMPause() {
	//EMAIL ACCOUNT MANAGER FROM accountManager VARIABLE.
	MailApp.sendEmail({
	to:accountManager + '@theonlinedirector.com.au',
	subject:accountName + ' Monthly Budget Reached.',
	htmlBody:'<!DOCTYPE html><html><body><b>Have paused Campaigns as Monthly spend of '+ PAUSE_COST +' has been spent. Advise '+ accountManager +' that monthly limit has been reached.<br />Sent From Beta Budget Script.<br />' + Logger.getLog() + '</b></body></html>'
	});
	//LOG EMAIL SENT.
	Logger.log('PAUSE Email Sent To AM<br />');
}

function emailSupportEnable() {
	//EMAIL SUPPORT.
	MailApp.sendEmail({
	to: supportEmail,
	subject:accountName + ' CAMPAIGN CHANGE DETECTED.',
	htmlBody:'<!DOCTYPE html><html><body><b>Enabled Campaigns Script RAN as Monthly Cost of '+ PAUSE_COST +' is below Budget. Advise '+ accountManager +' that Campaigns have been CHANGED.<br />Sent From Beta Budget Script.<br />' + Logger.getLog() + '</b></body></html>'
	});
	//LOG EMAIL SENT.
	Logger.log('ENABLE Email Sent To Support<br />');
}

function emailAMEnable() {
	//EMAIL ACCOUNT MANAGER FROM accountManager VARIABLE.
	MailApp.sendEmail({
	to:accountManager,
	subject:accountName + ' CAMPAIGN CHANGE DETECTED.',
	htmlBody:'<!DOCTYPE html><html><body><b>Enabled Campaigns Script RAN as Monthly Cost of '+ PAUSE_COST +' is below Budget. Advise '+ accountManager +' that Campaigns have been CHANGED.<br />Sent From Beta Budget Script.<br />' + Logger.getLog() + '</b></body></html>'
	});
	//LOG EMAIL SENT.
	Logger.log('ENABLE Email Sent To AM<br />');
}