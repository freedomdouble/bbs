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
	StyleSheet,
	Dimensions
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import dismissKeyboard from 'dismissKeyboard';
import ImageSizing from './ImageSizing';

const ScreenW = Dimensions.get('window').width;

export default class PostsCommentReplys extends Component {

	constructor(props) {

		super(props);

		this.user = null;
		this.submited = false;
		this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		this.reply_num = '暂无';

		this.state = { comment: null, dataSource: this.ds.cloneWithRows([]), is_focus: 0, content: '' };
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

		this._fetchData();
	}

	// 初始化数据
	async _fetchData() {

		let url = 'http://121.11.71.33:8081/api/comment/replys?id=' + this.props.navigation.state.params.id;

		console.log(url);

		try {
			let response = await fetch(url, { headers: { 'Authorization': this.user.token } });
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
			this.reply_num = result.replys.length;
			this.setState({ comment: result.comment, dataSource: this.ds.cloneWithRows(result.replys), is_focus: result.is_focus });
		}
	}

	// 添加关注 | 取消关注
	async _focus(user_id) {

		dismissKeyboard();

		let _this = this;

		if (_this.submited == true) {
			ToastAndroid.show('正在提交数据...', ToastAndroid.SHORT);
			return;
		}

		ToastAndroid.show('提交数据...', ToastAndroid.SHORT);

		_this.submited = true;

		let data = new FormData();
		data.append('user_id', user_id);
		data.append('focus', _this.state.is_focus);

		try {
			let response = await fetch('http://121.11.71.33:8081/api/user/focus', {
				method: 'POST',
				headers: {
					'Content-Type': 'multipart/form-data',
					'Authorization': _this.user.token
				},
				body: data
			});

			var result = await response.json();
		} catch (error) {
			_this.submited = false;
			ToastAndroid.show('网络错误', ToastAndroid.SHORT);
			return;
		}

		_this.submited = false;

		ToastAndroid.show(result.msg, ToastAndroid.SHORT);

		if (result.status == 0) {
			_this.props.navigation.navigate('Login');
			return;
		}
		if (result.status == 1) {
			let is_focus = _this.state.is_focus;
			is_focus = is_focus == 1 ? 0 : 1;
			_this.setState({ is_focus: is_focus });
		}
	}

	// 回复
	async _onSubmitReply() {
		// 隐藏输入键盘
		dismissKeyboard();

		if (this.user == null) {
			ToastAndroid.show('请先登录', ToastAndroid.SHORT);
			_this.props.navigation.navigate('Login');
			return;
		}

		if (this.submited == true) {
			ToastAndroid.show('正在提交...', ToastAndroid.SHORT);
			return;
		}

		ToastAndroid.show('正在提交...', ToastAndroid.SHORT);

		this.submited = true;

		let data = new FormData();
		data.append('content', this.state.content);
		data.append('parent_id', this.state.comment.id);
		data.append('posts_id', this.state.comment.posts_id);

		try {
			let response = await fetch('http://121.11.71.33:8081/api/posts/comment', {
				method: 'POST',
				headers: {
					'Content-Type': 'multipart/form-data',
					'Authorization': this.user.token
				},
				body: data
			});
			var result = await response.json();
		} catch (error) {
			this.submited = true;
			ToastAndroid.show('网络错误', ToastAndroid.SHORT);
			return;
		}

		ToastAndroid.show(result.msg, ToastAndroid.SHORT);

		if (result.status == -1) {
			this.submited = false;
			return;
		}
		if (result.status == 0) {
			this.props.navigation.navigate('Login');
			return;
		}
		if (result.status == 1) {
			this.submited = false;
			this.setState({ content: '' });
			this._fetchData();
			return;
		}
	}

	render() {

		let _this = this;

		let _body = (
			<View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
				<ActivityIndicator animating={true} size="large" color="#03c893" />
			</View>
		);

		if (_this.state.comment != null) {

			let contentWrapper = [];

			_this.state.comment.content.forEach((c, index) => {
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

			_body = (
				<View style={{ flex: 1, backgroundColor: '#fff' }}>
					<ScrollView showsVerticalScrollIndicator={true} showsHorizontalScrollIndicator={false}>
						<View style={{ backgroundColor: '#fff', paddingTop: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc' }}>
							{/*评论头部信息*/}
							<View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
								{/*头像*/}
								<TouchableHighlight style={{ height: 38, width: 38 }} underlayColor="rgba(0,0,0,0.1)"
									onPress={() => { this.props.navigation.navigate('User', { id: _this.state.comment.user_id }); }}>
									<Image style={{ height: 38, width: 38 }} source={{ uri: _this.state.comment.avator }} />
								</TouchableHighlight>
								{/*昵称*/}
								<View style={{ flexDirection: 'row', flex: 1, marginLeft: 7 }}>
									<TouchableHighlight underlayColor="rgba(0,0,0,0.1)"
										onPress={() => { this.props.navigation.navigate('User', { id: _this.state.comment.user_id }); }}>
										<Text style={{ fontSize: 14, color: '#ccc' }}>{_this.state.comment.nickname}</Text>
									</TouchableHighlight>
									<Text style={{ fontSize: 10, paddingTop: 5, color: '#03c893' }}> {_this.state.comment.is_lz == 1 ? '楼主' : ''}</Text>
								</View>
								{/*关注*/}
								<TouchableHighlight style={{ backgroundColor: '#03c893', borderRadius: 3 }} underlayColor="rgba(0,0,0,0.1)" onPress={() => { _this._focus(_this.state.comment.user_id) }}>
									<Text style={{ color: '#fff', paddingHorizontal: 5, fontSize: 12, paddingVertical: 1 }}>{_this.state.is_focus == 1 ? '取消关注' : '添加关注'}</Text>
								</TouchableHighlight>
							</View>
							{/*评论内容*/}
							<View style={{ flex: 1, paddingHorizontal: 12 }}>
								{contentWrapper}
							</View>
							{/*评论底部信息*/}
							<View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 12, paddingHorizontal: 12, marginTop: 12 }}>
								<Text style={{ fontSize: 12, color: '#ccc' }}>{_this.state.comment.created}</Text>
								<View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#ccc', marginHorizontal: 5 }} />
								<Text style={{ fontSize: 12, color: '#ccc' }}>{_this.reply_num == 0 ? '暂无' : _this.reply_num + '条'}回复</Text>
							</View>
						</View>

						{_this.reply_num == 0 ? false : (<View style={{ height: 15, backgroundColor: '#eee' }} />)}

						{/*回复列表*/}
						<View style={{ backgroundColor: '#eee', flex: 1, borderTopWidth: _this.reply_num == 0 ? 0 : StyleSheet.hairlineWidth, borderColor: '#ccc' }}>
							<ListView
								enableEmptySections={true}
								dataSource={_this.state.dataSource}
								renderRow={(rowData) => {

									let contentWrapper2 = [];

									rowData.content.forEach((c, index) => {
										if (c.key == 'p') {
											contentWrapper2.push(<Text key={index} style={{ color: '#222', fontSize: 14, marginTop: 12 }}>{c.value}</Text>);
										}
										if (c.key == 'img') {
											contentWrapper2.push(
												<View key={index} style={{ marginTop: 12 }}>
													<ImageSizing uri={c.value} width={ScreenW - 24} height={ScreenW * 2} />
												</View>
											);
										}
									});

									return (
										<View style={{
											paddingHorizontal: 12, paddingTop: 14, borderBottomWidth: StyleSheet.hairlineWidth,
											borderColor: '#ccc', backgroundColor: '#fff'
										}}>
											<View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
												<TouchableHighlight style={{ height: 38, width: 38 }} underlayColor="rgba(0,0,0,0.1)"
													onPress={() => { this.props.navigation.navigate('User', { id: rowData.user_id }); }}>
													<Image style={{ height: 38, width: 38 }} source={{ uri: rowData.avator }} />
												</TouchableHighlight>
												<View style={{ flex: 1, marginLeft: 10, flexDirection: 'row' }}>
													<TouchableHighlight underlayColor="rgba(0,0,0,0.1)"
														onPress={() => { this.props.navigation.navigate('User', { id: rowData.user_id }); }}>
														<Text style={{ fontSize: 14, color: '#ccc' }}>{rowData.nickname}</Text>
													</TouchableHighlight>
													<Text style={{ fontSize: 10, paddingTop: 5, color: '#03c893' }}> {rowData.is_lz == 1 ? '楼主' : ''}</Text>
													<View style={{ flex: 1, alignItems: 'flex-end' }}>
														<Text style={{ fontSize: 12, color: '#ccc' }}>{rowData.created}</Text>
													</View>
												</View>
											</View>
											<View style={{ flex: 1, paddingBottom: 16 }}>
												{contentWrapper2}
											</View>
										</View>
									);
								}}
							/>
						</View>
					</ScrollView>

					{/*回复输入框*/}
					<View style={{ padding: 9, backgroundColor: '#eee', borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#ccc' }}>
						<TextInput
							style={{ fontSize: 14, backgroundColor: '#fff', height: 40, borderRadius: 3 }}
							autoFocus={this.reply_num == 0 ? true : false}
							placeholder={'回复：' + _this.state.comment.nickname}
							placeholderTextColor="#ccc"
							blurOnSubmit={false}
							underlineColorAndroid="rgba(0,0,0,0)"
							returnKeyType="send"
							onChangeText={(content) => _this.setState({ content })}
							onSubmitEditing={(event) => { _this._onSubmitReply() }}
							value={_this.state.content}
						/>
					</View>
				</View>
			);
		}

		return (
			<View style={{ flex: 1 }}>
				{/*状态栏*/}
				<StatusBar backgroundColor="#03c893" />
				{/*导航栏*/}
				<View style={{ flexDirection: 'row', height: 45, backgroundColor: '#03c893', justifyContent: 'space-between', paddingHorizontal: 12 }}>
					<TouchableHighlight underlayColor="rgba(0,0,0,0)" style={{ alignItems: 'center', justifyContent: 'center' }}
						onPress={() => { dismissKeyboard(); _this.props.navigation.state.params.callBack(); _this.props.navigation.goBack(null); }}>
						<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
							<Icon name="ios-arrow-back-outline" size={22} color="#fff" />
							<Text style={{ color: '#fff', fontSize: 16, marginLeft: 5 }}>回复列表</Text>
						</View>
					</TouchableHighlight>
				</View>
				{/*内容主体*/}
				{_body}
			</View>
		);
	}
}
