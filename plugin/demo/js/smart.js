H.add('SMART', function(HLG) {
	var S = KISSY,
	DOM = S.DOM,
	Event = S.Event;

	//促销活动模块
	var smart = {        
        //tab切换
        active_tab: function(container) {
            //团购tab 页切换
            new S.Tabs('#J_Smart', {
                navCls: 'ks-switchable-nav',
                contentCls: 'ks-switchable-content',
                activeTriggerCls: 'current',
                autoplay:false
            });
			return this;
		}
		
		
	};
	
	//对外接口
	if( !H.app.smart ) H.app.smart = smart;
});