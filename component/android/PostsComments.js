'use strict';

import React, { Component } from 'react';
import {
	View,
	ListView,
	TouchableHighlight,
	Text,
	Image,
	StatusBar,
	ActivityIndicator,
	ScrollView,
	ToastAndroid,
	AsyncStorage,
	TextInput,
	KeyboardAvoidingView,
	BackAndroid,
	Dimensions,
	StyleSheet
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import dismissKeyboard from 'dismissKeyboard';
import ImageSizing from './ImageSizing';

const ScreenW = Dimensions.get('window').width;

export default class PostsComments extends Component {

	constructor(props) {

		super(props);

		this.user = null;
		this.loaded = false;
		this.data = [];
		this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

		this.state = { dataSource: this.ds.cloneWithRows([]), comment_account: 0 };
	}

	componentWillMount() {
		BackAndroid.addEventListener('hardwareBackPress', this._onBackAndroid);
	}

	componentWillUnmount() {
		BackAndroid.removeEventListener('hardwareBackPress', this._onBackAndroid);
	}

	_onBackAndroid = () => {
		dismissKeyboard();
		this.props.navigation.state.params.callBack();
		this.props.navigation.goBack();
		return true;
	}

	async componentDidMount() {

		let _this = this;

		try {
			const user = await AsyncStorage.getItem('user');

			if (user !== null) {
				_this.user = JSON.parse(user);
			}
		} catch (error) {
			ToastAndroid.show('存储异常', ToastAndroid.SHORT);
		}

		_this._fetchData();
	}

	// 初始化数据
	async _fetchData() {

		let url = 'http://121.11.71.33:8081/api/posts/comments?order=ASC&id=' + this.props.navigation.state.params.id;

		console.log(url);

		try {
			let response = await fetch(url);
			var result = await response.json();
		} catch (error) {
			ToastAndroid.show('网络错误', ToastAndroid.SHORT);
			return;
		}

		this.loaded = true;

		if (result.status == -1) {
			ToastAndroid.show(result.msg, ToastAndroid.SHORT);
			return;
		}

		if (result.status == 1) {
			this.data = result.data;
			this.setState({ dataSource: this.ds.cloneWithRows(this.data), comment_account: result.comment_account });
		}
	}

	render() {

		let _bottom = null;
		let _body = (
			<View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
				<ActivityIndicator animating={true} size="large" />
			</View>
		);

		if (this.loaded == true) {

			if (this.data.length == 0) {
				_body = (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 14, color: '#888' }}>暂无评论</Text></View>)

			} else {
				_body = (
					<View style={{ flex: 1 }}>
						<ListView
							enableEmptySections={true}
							dataSource={this.state.dataSource}
							renderRow={(rowData) => {

								let contentWrapper = [];

								rowData.content.forEach((c, index) => {
									if (c.key == 'p') {
										contentWrapper.push(<Text key={index} style={{ color: '#222', fontSize: 14, marginTop: 12 }}>{c.value}</Text>);
									}
									if (c.key == 'img') {
										contentWrapper.push(
											<View key={index} style={{ marginTop: 12 }}>
												<ImageSizing uri={c.value} width={ScreenW - 24} height={ScreenW * 2} />
											</View>
										);
									}
								});

								return (
									<View style={{ paddingHorizontal: 12, paddingTop: 16, paddingBottom: 14, backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc' }}>
										<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
											<TouchableHighlight style={{ height: 38, width: 38 }} underlayColor="rgba(0,0,0,0.1)"
												onPress={() => { this.props.navigation.navigate('User', { id: rowData.user_id }); }}>
												<Image style={{ height: 38, width: 38 }} source={{ uri: rowData.avator }} />
											</TouchableHighlight>
											<View style={{ flex: 1, marginLeft: 10, flexDirection: 'row' }}>
												<TouchableHighlight underlayColor="rgba(0,0,0,0.1)" onPress={() => { this.props.navigation.navigate('User', { id: rowData.user_id }); }}>
													<Text style={{ fontSize: 14, color: '#ccc' }}>{rowData.nickname}</Text>
												</TouchableHighlight>
												<Text style={{ fontSize: 10, paddingTop: 5, color: '#03c893' }}> {rowData.is_lz == 1 ? '楼主' : ''}</Text>
												<View style={{ flex: 1, alignItems: 'flex-end' }}>
													<Text style={{ fontSize: 14, color: '#ccc' }}>{rowData.floor}F</Text>
												</View>
											</View>
										</View>
										<View style={{ flex: 1 }}>
											{contentWrapper}
										</View>
										<View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', marginTop: 12 }}>
											<Text style={{ fontSize: 12, color: '#ccc' }}>{rowData.created}</Text>
											<View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#ccc', marginHorizontal: 5 }} />
											<TouchableHighlight
												underlayColor="rgba(0,0,0,0.1)"
												onPress={() => {
													if (this.user == null) {
														this.props.navigation.navigate('Login');
														return;
													}
													this.props.navigation.navigate('PostsCommentReplys', { id: rowData.id, callBack: () => { this._fetchData() } });
												}}
											>
												<Text style={{ fontSize: 12, color: '#ccc', marginLeft: 2 }}>{rowData.reply_account == 0 ? '' : rowData.reply_account}回复></Text>
											</TouchableHighlight>
										</View>
									</View>
								);
							}}
						/>
					</View>
				);
			}
		}


		return (
			<View style={{ flex: 1, backgroundColor: '#fff' }}>
				{/* 状态栏 */}
				<StatusBar backgroundColor="#03c893" />
				{/* 导航栏 */}
				<View style={{ flexDirection: 'row', height: 45, backgroundColor: '#03c893', paddingHorizontal: 11, justifyContent: 'space-between' }}>
					<TouchableHighlight underlayColor="rgba(0,0,0,0)" style={{ alignItems: 'center', justifyContent: 'center' }}
						onPress={() => { this.props.navigation.state.params.callBack(); this.props.navigation.goBack(null); }}>
						<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
							<Icon name="ios-arrow-back-outline" size={22} color="#fff" />
							<Text style={{ color: '#fff', fontSize: 16, marginLeft: 5 }}>评论列表({this.state.comment_account})</Text>
						</View>
					</TouchableHighlight>
					<TouchableHighlight underlayColor="rgba(0,0,0,0)" style={{ alignItems: 'flex-end', justifyContent: 'center' }}
						onPress={() => {
							if (this.user == null) {
								this.props.navigation.navigate('Login');
								return;
							}
							this.props.navigation.navigate('PostsComment', { posts_id: this.props.navigation.state.params.id, parent_id: 0, callBack: () => { this._fetchData() } });
						}}
					>
						<Text style={{ color: '#fff', fontSize: 16, marginLeft: 5 }}>我要评论</Text>
					</TouchableHighlight>
				</View>
				{/*内容主体*/}
				{_body}
			</View>
		);
	}
}
