'use strict';

import React, { Component } from 'react';
import {
	View,
	Text,
	Image,
	StatusBar,
	TouchableHighlight,
	ScrollView,
	AsyncStorage,
	ToastAndroid,
	StyleSheet,
	ViewPagerAndroid,
	Dimensions,
	ActivityIndicator,
	BackAndroid
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ScreenW = Dimensions.get('window').width;

export default class MineFocus extends Component {

	constructor(props) {

		super(props);

		this.user = null;
		this._viewPage = {};

		this.state = {
			isLoading: true,
			currentTab: this.props.navigation.state.params.currentTab,
			focusArr: [],
			isFocusLoaded: false,
			fansArr: [],
			isFansLoaded: false
		};
	}

	componentWillMount() {
		BackAndroid.addEventListener('hardwareBackPress', this._onBackAndroid);
	}

	componentWillUnmount() {
		BackAndroid.removeEventListener('hardwareBackPress', this._onBackAndroid);
	}

	_onBackAndroid = () => {
		this.props.navigation.goBack(null);
		return true;
	}

	async componentDidMount() {

		try {
			const user = await AsyncStorage.getItem('user');
			if (user !== null) {
				this.user = JSON.parse(user);
			}
		} catch (error) {
			ToastAndroid.show('存储异常', ToastAndroid.SHORT);
		}

		await this._fetchData(this.state.currentTab);
	}

	async _fetchData(currentTab) {

		let flag;

		if (currentTab == 0) {
			flag = 'focus';
			if (this.state.isFocusLoaded == true) {
				return;
			}
		} else {
			flag = 'fans';
			if (this.state.isFansLoaded == true) {
				return;
			}
		}

		this.setState({ isLoading: true });

		let data = new FormData();
		data.append('flag', flag);

		const url = 'http://121.11.71.33:8081/api/user/relate?flag=' + flag;

		try {
			let response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'multipart/form-data',
					'Authorization': this.user.token
				},
				body: data
			});
			var result = await response.json();
		} catch (error) {
			this.setState({ isLoading: false });
			ToastAndroid.show('网络错误', ToastAndroid.SHORT);
			return;
		}

		if (result.status == 0) {
			this.setState({ isLoading: false });
			ToastAndroid.show(result.msg, ToastAndroid.SHORT);
			return;
		}

		if (result.status == -1) {
			this.setState({ isLoading: false });
			ToastAndroid.show(result.msg, ToastAndroid.SHORT);
			return;
		}

		if (result.status == 1) {
			if (currentTab == 0) {
				this.setState({ isLoading: false, isFocusLoaded: true, focusArr: result.list });
			}
			else {
				this.setState({ isLoading: false, isFansLoaded: true, fansArr: result.list });
			}
		}
	}

	_renderTabs() {

		let items = [{ index: 0, txt: '关注' }, { index: 1, txt: '粉丝' }];
		let itemWraper = [];
		let TouchableHighlightStyle = {};
		let textStyle = {};

		items.forEach((item, index) => {
			if (item.index == this.state.currentTab) {
				TouchableHighlightStyle = styles.tab_item_active;
				textStyle = styles.tab_item_text_active;
			}
			else {
				TouchableHighlightStyle = styles.tab_item;
				textStyle = styles.tab_item_text
			}
			itemWraper.push(
				<TouchableHighlight underlayColor="rgba(0,0,0,0)" key={index} style={TouchableHighlightStyle} onPress={() => { this._onPressTab(item.index) }}>
					<Text style={textStyle}>{item.txt}</Text>
				</TouchableHighlight>
			);
		});

		return itemWraper;
	}

	_onPressTab(currentTab) {
		this.setState({ currentTab: currentTab });
		this._viewPage.setPage(currentTab);
		this._fetchData(currentTab);
	}

	_onPageSelected = (e) => {
		let currentTab = e.nativeEvent.position;
		this.setState({ currentTab: currentTab });
		this._viewPage.setPage(currentTab);
		this._fetchData(currentTab);
	}

	render() {

		let _this = this;
		let _body = null;

		if (_this.state.isLoading == true) {
			_body = (
				<View style={{ flex: 1, backgroundColor: '#f4f4f4', alignItems: 'center', justifyContent: 'center' }}>
					<ActivityIndicator animating={true} size="large" color="#03c893" />
				</View>
			);
		}
		else {

			let focusListWraper = null;
			let fansListWraper = null;

			if (_this.state.focusArr.length == 0 && _this.state.currentTab == 0) {
				focusListWraper = (
					<View style={{ width: ScreenW, flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee' }}>
						<Text style={{ color: '#ccc' }}>暂无关注</Text>
					</View>
				);
			} else {
				let focusWraper = [];

				_this.state.focusArr.forEach((item, index) => {
					focusWraper.push(
						<TouchableHighlight key={index} underlayColor="rgba(0,0,0,0.1)" onPress={() => { this.props.navigation.navigate('User', { id: item.to_id }) }}>
							<View style={styles.list_item_wraper}>
								<Image style={{ height: 50, width: 50, borderRadius: 25 }} source={{ uri: item.avator }} />
								<Text style={{ flex: 1, color: '#222', marginLeft: 10 }}>{item.nickname}</Text>
								<Icon name="ios-arrow-forward-outline" size={20} color="#eee" />
							</View>
						</TouchableHighlight>
					);
				});

				focusListWraper = (
					<View style={{ width: ScreenW, flex: 1 }}>
						<ScrollView showsVerticalScrollIndicator={false}>
							{focusWraper}
						</ScrollView>
					</View>
				);
			}

			if (_this.state.fansArr.length == 0 && _this.state.currentTab == 1) {
				fansListWraper = (
					<View style={{ width: ScreenW, flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee' }}>
						<Text style={{ color: '#ccc' }}>暂无粉丝</Text>
					</View>
				);
			} else {
				let fansWraper = [];

				_this.state.fansArr.forEach((item, index) => {
					fansWraper.push(
						<TouchableHighlight key={index} underlayColor="rgba(0,0,0,0.1)" onPress={() => { this.props.navigation.navigate('User', { id: item.from_id }) }}>
							<View style={styles.list_item_wraper}>
								<Image style={{ height: 50, width: 50, borderRadius: 25 }} source={{ uri: item.avator }} />
								<Text style={{ flex: 1, color: '#222', marginLeft: 10 }}>{item.nickname}</Text>
								<Icon name="ios-arrow-forward-outline" size={20} color="#eee" />
							</View>
						</TouchableHighlight>
					);
				});

				fansListWraper = (
					<View style={{ width: ScreenW, flex: 1 }}>
						<ScrollView showsVerticalScrollIndicator={false}>
							{fansWraper}
						</ScrollView>
					</View>
				);
			}

			_body = (
				<View style={{ flex: 1, backgroundColor: '#eee' }}>
					<ViewPagerAndroid
						ref={viewPager => { _this._viewPage = viewPager; }}
						style={{ width: ScreenW, flex: 1 }}
						initialPage={_this.state.currentTab}
						onPageSelected={_this._onPageSelected}>
						{ /*关注列表*/}
						{focusListWraper}
						{ /*粉丝列表*/}
						{fansListWraper}
					</ViewPagerAndroid >
				</View>
			);

		}

		return (
			<View style={{ flex: 1 }}>
				{/*状态栏*/}
				<StatusBar backgroundColor="#03c893" />
				{/*导航栏*/}
				<View style={{ flexDirection: 'row', height: 45, backgroundColor: '#03c893', paddingHorizontal: 10 }}>
					<TouchableHighlight underlayColor="rgba(0,0,0,0)" style={{ flex: 2, alignItems: 'flex-start', justifyContent: 'center' }} onPress={() =>
						_this.props.navigation.goBack(null)
					}>
						<View style={{ flexDirection: 'row' }}>
							<Icon name="ios-arrow-back-outline" size={22} color="#fff" />
							<Text style={{ color: '#fff', fontSize: 16, marginLeft: 4 }}>返回</Text>
						</View>
					</TouchableHighlight>
					<View style={{ flex: 8, alignItems: 'center', justifyContent: 'center' }}>
						<View style={styles.tab}>
							{_this._renderTabs()}
						</View>
					</View>
					<View style={{ flex: 2 }} />
				</View>
				{/*内容主体*/}
				{_body}

			</View>
		);
	}
}

const styles = StyleSheet.create({

	tab: {
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
	},
	tab_item: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	tab_item_active: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	tab_item_text: {
		fontSize: 16,
		color: '#dcdcdc',
		paddingHorizontal: 9
	},
	tab_item_text_active: {
		fontSize: 16,
		color: '#fff',
		paddingHorizontal: 9
	},

	list_item_wraper: {
		paddingHorizontal: 10,
		paddingVertical: 13,
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderColor: '#eee'
	}

});
