'use strict';

import React, { Component } from 'react';
import {
	View,
	Text,
	Animated,
	StatusBar,
	FlatList,
	BackAndroid,
	ToastAndroid,
	ActivityIndicator,
	TouchableHighlight
} from 'react-native';

import Carousel from './Carousel';
import LoadMore from './LoadMore';
import IndexPostsRow from './IndexPostsRow';
import Icon from 'react-native-vector-icons/Ionicons';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default class Index extends Component {

	constructor(props) {

		super(props);

		this.page = 1;
		this.isPageEnd = false;

		this.state = { listData: [], viewData: [], loadMoreFlag: 0, refreshing: false, isNetDown: false };
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
			return;
		}

		if (result.status == -1) {
			ToastAndroid.show(result.msg, ToastAndroid.SHORT);
			return;
		}

		if (result.status == 1) {
			this.setState({ viewData: result.list, isNetDown: false });
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
			this.setState({ isNetDown: true, refreshing: false });
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
			let listData = this.state.listData;

			if (listLength < 10) {
				this.isPageEnd = true;
				loadMoreFlag = 2;
			}

			listData = listData.concat(result.list);

			this.page += 1;
			this.setState({ loadMoreFlag: loadMoreFlag, listData: listData, isNetDown: false });
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
			this.setState({ isNetDown: true, refreshing: false });
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

			let listLength = result.list.length;
			let loadMoreFlag = 0;
			let listData = [];

			if (listLength < 10) {
				this.isPageEnd = true;
				loadMoreFlag = 2;
			}

			listData = listData.concat(result.list);

			this.setState({ loadMoreFlag: loadMoreFlag, listData: listData, refreshing: false });

			ToastAndroid.show('刷新成功', ToastAndroid.SHORT);
		}
	}

	_ListHeaderComponent() {
		return <Carousel navigation={this.props.navigation} viewData={this.state.viewData} />;
	}

	_renderItem = ({ item }) => {
		return <IndexPostsRow navigation={this.props.navigation} rowData={item} />;
	}

	_ListFooterComponent() {
		return <LoadMore loadMoreFlag={this.state.loadMoreFlag} bgcolor='#fff' />;
	}

	_shouldItemUpdate(prev, next) {
		return prev.item !== next.item;
	}

	render() {

		let body = (
			<View style={{ flex: 1, backgroundColor: '#f4f4f4', alignItems: 'center', justifyContent: 'center' }}>
				<ActivityIndicator animating={true} size="large" color="#03c893" />
			</View>
		);

		if (this.state.isNetDown == true && this.state.listData.length == 0 && this.state.viewData.length == 0) {
			body = (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					<TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => { this._onRefresh() }}>
						<View style={{ alignItems: 'center' }}>
							<Icon name="ios-refresh-circle-outline" color="#03c893" size={40} />
							<Text style={{ fontSize: 12, color: '#03c893' }}>点击刷新</Text>
						</View>
					</TouchableHighlight>
				</View>
			);
		}

		if (this.state.listData.length > 0 && this.state.viewData.length > 0) {
			body = (
				<AnimatedFlatList
					refreshing={this.state.refreshing}
					data={this.state.listData}
					debug={false}
					disableVirtualization={true}
					legacyImplementation={false}
					numColumns={1}
					removeClippedSubviews={false}
					ListHeaderComponent={this._ListHeaderComponent.bind(this)}
					renderItem={this._renderItem.bind(this)}
					ListFooterComponent={this._ListFooterComponent.bind(this)}
					onRefresh={this._onRefresh.bind(this)}
					shouldItemUpdate={this._shouldItemUpdate.bind(this)}
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
			</View>
		);
	}
}