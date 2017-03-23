'use strict';

import React, { Component } from 'react';
import {
	View,
	Text,
	StatusBar,
	ListView,
	BackAndroid,
	ToastAndroid,
	ActivityIndicator,
	RefreshControl
} from 'react-native';

// import BottomNav from './BottomNav';
import Carousel from './Carousel';
import LoadMore from './LoadMore';
import IndexPostsRow from './IndexPostsRow';

export default class Index extends Component {

	constructor(props) {

		super(props);

		this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		this.page = 1;
		this.isPageEnd = false;
		this.listData = [];

		this.state = { dataSource: this.ds.cloneWithRows([]), viewData: [], loadMoreFlag: 0, refreshing: false };
	}

	componentWillMount() {
		BackAndroid.removeEventListener('hardwareBackPress', this._onBackAndroid);
		BackAndroid.addEventListener('hardwareBackPress', this._onBackAndroid);
	}

	componentWillUnmount() {
		BackAndroid.removeEventListener('hardwareBackPress', this._onBackAndroid);
	}

	_onBackAndroid = () => {
		if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
			BackAndroid.exitApp();
			return true;
		} else {
			this.lastBackPressed = Date.now();
			ToastAndroid.show('再按一次退出', ToastAndroid.SHORT);
			return true;
		}
	}

	componentDidMount() {
		this._fetchViewData();
		this._fetchListData();
	}

	// 获取轮播图列表数据
	async _fetchViewData() {

		let url = 'http://121.11.71.33:8081/api/recommend/list?unique=appshouyelunbotu';

		console.log(url);

		try {
			let response = await fetch(url);
			var result = await response.json();
		} catch (error) {
			ToastAndroid.show('网络错误', ToastAndroid.SHORT);
			return;
		}

		if (result.status == -1) {
			ToastAndroid.show(result.msg, ToastAndroid.SHORT);
			return;
		}

		if (result.status == 1) {
			this.setState({ viewData: result.list });
		}
	}

	// 获取推荐列表数据
	async _fetchListData() {

		let url = 'http://121.11.71.33:8081/api/recommend/list?unique=appshouyeliebiao&page=' + this.page;

		console.log(url);

		try {
			let response = await fetch(url);
			var result = await response.json();
		} catch (error) {
			ToastAndroid.show('网络错误', ToastAndroid.SHORT);
			return;
		}

		if (result.status == -1) {
			this.isPageEnd = true;
			this.setState({ loadMoreFlag: 2 });
			return;
		}

		if (result.status == 1) {
			let listLength = result.list.length;
			let loadMoreFlag = 0;

			if (listLength < 10) {
				this.isPageEnd = true;
				loadMoreFlag = 2;
			}

			for (var i = 0; i < listLength; i++) {
				this.listData.push(result.list[i]);
			}
			this.page += 1;
			this.setState({ loadMoreFlag: loadMoreFlag, dataSource: this.ds.cloneWithRows(this.listData) });
		}
	}

	async _onRefresh() {

		this.setState({ refreshing: true });

		this._fetchViewData();

		let url = 'http://121.11.71.33:8081/api/recommend/list?unique=appshouyeliebiao&page=' + 1;

		console.log(url);

		try {
			let response = await fetch(url);
			var result = await response.json();
		} catch (error) {
			ToastAndroid.show('网络错误', ToastAndroid.SHORT);
			return;
		}

		if (result.status == -1) {
			this.isPageEnd = true;
			this.setState({ loadMoreFlag: 2 });
			return;
		}

		if (result.status == 1) {

			this.page = 2;
			this.isPageEnd = false;
			this.listData = [];

			let listLength = result.list.length;
			let loadMoreFlag = 0;

			if (listLength < 10) {
				this.isPageEnd = true;
				loadMoreFlag = 2;
			}

			for (var i = 0; i < listLength; i++) {
				this.listData.push(result.list[i]);
			}

			this.setState({ loadMoreFlag: loadMoreFlag, dataSource: this.ds.cloneWithRows(this.listData), refreshing: false });

			ToastAndroid.show('刷新成功', ToastAndroid.SHORT);
		}
	}

	_renderHeader() {
		return <Carousel navigation={this.props.navigation} viewData={this.state.viewData} />;
	}

	_renderRow(rowData) {
		return <IndexPostsRow navigation={this.props.navigation} rowData={rowData} />;
	}

	_renderFooter() {
		return <LoadMore loadMoreFlag={this.state.loadMoreFlag} bgcolor='#fff' />;
	}

	render() {

		let body = (
			<View style={{ flex: 1, backgroundColor: '#f4f4f4', alignItems: 'center', justifyContent: 'center' }}>
				<ActivityIndicator animating={true} size="large" color="#03c893" />
			</View>
		);

		if (this.listData.length > 0 && this.state.viewData.length > 0) {
			body = (
				<ListView
					refreshControl={
						<RefreshControl enabled={true} refreshing={this.state.refreshing} onRefresh={() => this._onRefresh()} progressBackgroundColor='#eee' colors={['#ffaa66cc', '#ff00ddff']} />
					}
					showsVerticalScrollIndicator={true}
					showsHorizontalScrollIndicator={false}
					enableEmptySections={true}
					removeClippedSubviews={false}
					dataSource={this.state.dataSource}
					renderHeader={this._renderHeader.bind(this)}
					renderRow={this._renderRow.bind(this)}
					renderFooter={this._renderFooter.bind(this)}
					onEndReached={() => {
						if (this.state.loadMoreFlag == 0 && this.isPageEnd == false) {
							this.setState({ loadMoreFlag: 1 });
							this._fetchListData();
						}
					}}
				/>
			);
		}

		return (
			<View style={{ flex: 1 }}>
				<View style={{ flex: 1, backgroundColor: '#fff' }}>
					{/* 状态栏 */}
					<StatusBar backgroundColor="#03c893" barStyle="light-content" />
					{/* 工具栏 */}
					<View style={{ flexDirection: 'row', height: 45, paddingHorizontal: 12, alignItems: 'center', backgroundColor: '#03c893' }}>
						<Text style={{ fontSize: 16, color: '#fff' }}>河源社区</Text>
					</View>
					{/* 主体内容 */}
					{body}
				</View>
				{/* 底部导航栏 */}
				{/*<BottomNav name="Index" nav={this.props.navigation} />*/}
			</View>
		);
	}
}