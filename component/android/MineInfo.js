'use strict'

import React, { Component } from 'react';
import {
	View,
	Text,
	StatusBar,
	AsyncStorage,
	TouchableHighlight,
	ToastAndroid,
	Dimensions,
	TextInput,
	Modal,
	BackAndroid,
	StyleSheet
} from 'react-native';
import dismissKeyboard from 'dismissKeyboard';
import Icon from 'react-native-vector-icons/Ionicons';

const ScreenW = Dimensions.get('window').width;

export default class MineInfo extends Component {

	constructor(props) {

		super(props);

		this.user = null;
		this.submited = false;

		this.state = {
			userInfo: null,
			// 昵称模态框标识
			isVisible: false,
			// 性别模态框标识
			isSexModalVisible: false,
			// 昵称输入信息
			text: '',
		};
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

		await this._fetchUserInfo();
	}

	componentWillMount() {
		BackAndroid.addEventListener('hardwareBackPress', this._onBackAndroid);
	}

	componentWillUnmount() {
		BackAndroid.removeEventListener('hardwareBackPress', this._onBackAndroid);
	}

	_onBackAndroid = () => {
		this.props.navigation.state.params.callback();
		this.props.navigation.goBack();
		return true;
	}

	// 取消选择性别
	_onPressSexCannel() {
		this._setSexModalVisible(false);
	}

	// 性别模态框设置
	_setSexModalVisible(isSexModalVisible) {
		this.setState({ isSexModalVisible: isSexModalVisible });
	}

	// 修改昵称模态框设置
	_setModalVisible(isVisible) {
		this.setState({ isVisible: isVisible });
	}

	// 取消修改昵称
	_onPressCannel() {
		this.setState({ text: '', isVisible: false });
	}

	// 提交修改昵称
	async _onPressSubmit() {

		if (this.user == null) {
			ToastAndroid.show('请先登录', ToastAndroid.SHORT);
			return;
		}

		if (this.state.text == '') {
			ToastAndroid.show('请输入新的昵称', ToastAndroid.SHORT);
			return;
		}

		// 隐藏输入键盘
		dismissKeyboard();

		if (this.submited == true) {
			ToastAndroid.show('正在提交数据...', ToastAndroid.SHORT);
			return;
		}

		this.submited = true;

		ToastAndroid.show('正在提交数据...', ToastAndroid.SHORT);

		let data = new FormData();
		data.append('nickname', this.state.text);

		try {
			let response = await fetch('http://121.11.71.33:8081/api/user/nickname', {
				method: 'POST',
				headers: {
					'Content-Type': 'multipart/form-data',
					'Authorization': this.user.token
				},
				body: data
			});
			var result = await response.json();
		} catch (error) {
			this.submited = false;
			ToastAndroid.show('网络错误', ToastAndroid.SHORT);
			return;
		}

		ToastAndroid.show(result.msg, ToastAndroid.SHORT);

		if (result.status == 0) {
			this.props.navigation.navigate('Login');
			return;
		}

		if (result.status == -1) {
			this.submited = false;
			return;
		}

		if (result.status == 1) {
			this.submited = false;
			let _user = this.user;
			_user.nickname = result.nickname;
			await AsyncStorage.setItem('user', JSON.stringify(_user));
			this.setState({ text: '', isVisible: false });
			this._fetchUserInfo();
		}
	}

	// 获取用户信息
	async _fetchUserInfo() {

		if (this.user == null) {
			ToastAndroid.show('请先登录', ToastAndroid.SHORT);
			return;
		}

		const url = 'http://121.11.71.33:8081/api/user/base';

		try {
			let response = await fetch(url, { headers: { 'Authorization': this.user.token } });
			var result = await response.json();
		} catch (error) {
			ToastAndroid.show('网络错误', ToastAndroid.SHORT);
			return;
		}

		if (result.status == 0) {
			ToastAndroid.show(result.msg, ToastAndroid.SHORT);
			this.props.navigation.navigate('Login');
		}

		if (result.status == 1) {
			this.setState({ userInfo: result.data });
		}
	}

	// 选择性别
	async _onPressSexSelected(sex) {

		if (this.user == null) {
			ToastAndroid.show('请先登录', ToastAndroid.SHORT);
			return;
		}

		this._setSexModalVisible(false);

		ToastAndroid.show('正在提交数据...', ToastAndroid.SHORT);

		let data = new FormData();
		data.append('sex', sex);

		const url = 'http://121.11.71.33:8081/api/user/sex';

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
			ToastAndroid.show('网络错误', ToastAndroid.SHORT);
			return;
		}

		ToastAndroid.show(result.msg, ToastAndroid.SHORT);

		if (result.status == 0) {
			this.props.navigation.navigate('Login');
			return;
		}

		if (result.status == -1) {
			return;
		}

		if (result.status == 1) {
			this._fetchUserInfo();
		}
	}

	// 点击手机
	_onPressMobile() {
		this.props.navigation.navigate('MineInfoMobile', { callback: () => { this._fetchUserInfo() } });
	}

	// 点击昵称
	_onPressNickname() {
		this._setModalVisible(true);
	}

	// 点击性别
	_onPressSex() {
		this._setSexModalVisible(true);
	}

	render() {

		let _body = null;
		let maleStyle = { color: '#ccc' };
		let femaleStyle = { color: '#ccc' };

		if (this.state.userInfo != null && this.state.userInfo.sex == '男') {
			maleStyle = { color: '#222' };
		}

		if (this.state.userInfo != null && this.state.userInfo.sex == '女') {
			femaleStyle = { color: '#222' };
		}

		_body = (
			<View style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
				<View style={{ height: 30 }} />
				<TouchableHighlight underlayColor="rgba(0,0,0,0.1)" onPress={() => this._onPressMobile()}>
					<View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18, backgroundColor: '#fff' }}>
						<View style={{ width: 30 }}><Icon name="ios-call-outline" size={20} color="#7fff00" /></View>
						<Text style={{ flex: 1, fontSize: 14, color: '#222' }}>手机</Text>
						<Text style={{ color: '#ccc', marginRight: 5 }}>{this.state.userInfo == null ? '' : this.state.userInfo.mobile}</Text>
						<Icon name="ios-arrow-forward-outline" size={20} color="#E5E5E3" />
					</View>
				</TouchableHighlight>
				<View style={{ height: 15 }} />
				<TouchableHighlight underlayColor="rgba(0,0,0,0.1)" onPress={() => this._onPressNickname()}>
					<View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18, backgroundColor: '#fff' }}>
						<View style={{ width: 30 }}><Icon name="ios-person-outline" size={20} color="#006400" /></View>
						<Text style={{ flex: 1, fontSize: 14, color: '#222' }}>昵称</Text>
						<Text style={{ color: '#ccc', marginRight: 5 }}>{this.state.userInfo == null ? '' : this.state.userInfo.nickname}</Text>
						<Icon name="ios-arrow-forward-outline" size={20} color="#E5E5E3" />
					</View>
				</TouchableHighlight>
				<View style={{ height: 15 }} />
				<TouchableHighlight underlayColor="rgba(0,0,0,0.1)" onPress={() => this._onPressSex()}>
					<View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18, backgroundColor: '#fff' }}>
						<View style={{ width: 30 }}><Icon name="md-female" size={20} color="#285586" /></View>
						<Text style={{ flex: 1, fontSize: 14, color: '#222' }}>性别</Text>
						<Text style={{ color: '#ccc', marginRight: 5 }}>{this.state.userInfo == null ? '' : this.state.userInfo.sex}</Text>
						<Icon name="ios-arrow-forward-outline" size={20} color="#E5E5E3" />
					</View>
				</TouchableHighlight>
			</View>
		);

		return (
			<View style={{ flex: 1 }}>
				{/* 修改昵称模态框 */}
				<Modal transparent={true} visible={this.state.isVisible} onRequestClose={() => { this._setModalVisible(false) }}>
					<StatusBar backgroundColor="#000" />
					<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', }}>
						<View style={{ backgroundColor: '#fff', zIndex: 1000, width: ScreenW * 0.7 }}>
							<Text style={{ color: '#999', paddingTop: 12, paddingHorizontal: 14, fontSize: 18 }}>修改昵称</Text>
							<TextInput
								style={{ borderBottomWidth: 1, borderColor: '#ccc', height: 45, paddingHorizontal: 14 }}
								keyboardType='email-address'
								placeholderTextColor="#ccc"
								underlineColorAndroid="rgba(0,0,0,0)"
								placeholder="请输入新的昵称"
								multiline={false}
								secureTextEntry={false}
								onChangeText={(text) => this.setState({ text: text })}
								value={this.state.text}
							/>
							<View style={{ flexDirection: 'row' }}>
								<TouchableHighlight
									style={{ flex: 1, height: 50, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderColor: '#ccc', }}
									onPress={() => this._onPressCannel()} underlayColor="rgba(0,0,0,0.1)">
									<Text style={{ color: '#ccc', fontSize: 16 }}>取消</Text>
								</TouchableHighlight>
								<TouchableHighlight
									style={{ flex: 1, height: 50, alignItems: 'center', justifyContent: 'center' }}
									onPress={() => this._onPressSubmit()} underlayColor="rgba(0,0,0,0.1)">
									<Text style={{ color: '#03c893', fontSize: 16 }}>确定</Text>
								</TouchableHighlight>
							</View>
						</View>
					</View>
				</Modal>
				{/* /修改昵称模态框 */}
				{/* 性别选择模态框 */}
				<Modal transparent={true} visible={this.state.isSexModalVisible} onRequestClose={() => { this._setSexModalVisible(false) }}>
					<StatusBar backgroundColor="#000" />
					<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', }}>
						<View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', zIndex: 1000, borderRadius: 5, width: ScreenW * 0.6 }}>
							<Text style={{ color: '#222', width: ScreenW * 0.6, paddingVertical: 12, textAlign: 'center', borderColor: '#ccc', borderBottomWidth: StyleSheet.hairlineWidth }}>请选择性别</Text>
							<View>
								<TouchableHighlight
									onPress={() => { this._onPressSexSelected('1') }} underlayColor="rgba(0,0,0,0.1)"
									style={{ alignItems: 'center', paddingVertical: 12, borderColor: '#ccc', borderBottomWidth: StyleSheet.hairlineWidth }}>
									<Text style={maleStyle}>男</Text>
								</TouchableHighlight>
								<TouchableHighlight
									onPress={() => { this._onPressSexSelected('2') }} underlayColor="rgba(0,0,0,0.1)"
									style={{ alignItems: 'center', paddingVertical: 12 }}>
									<Text style={femaleStyle}>女</Text>
								</TouchableHighlight>
								<TouchableHighlight
									onPress={() => { this._onPressSexCannel() }}
									underlayColor="rgba(0,0,0,0.1)"
									style={{ width: ScreenW * 0.6, alignItems: 'center', paddingVertical: 12, borderColor: '#ccc', borderTopWidth: StyleSheet.hairlineWidth }}>
									<Text style={{ color: '#03c893' }}>取消</Text>
								</TouchableHighlight>
							</View>
						</View>
					</View>
				</Modal>
				{/* /性别选择模态框 */}
				{/* 设置状态栏颜色 */}
				<StatusBar backgroundColor="#03c893" />
				{/* 顶部导航栏 */}
				<View style={{ flexDirection: 'row', height: 45, paddingHorizontal: 12, alignItems: 'center', backgroundColor: '#03c893', }}>
					<TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => { this.props.navigation.state.params.callback(); this.props.navigation.goBack(); }}>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<Icon name="ios-arrow-back-outline" size={22} color="#fff" style={{ marginTop: 1 }} />
							<Text style={{ color: '#fff', fontSize: 16, marginLeft: 7 }}>个人资料</Text>
						</View>
					</TouchableHighlight>
				</View>
				{/*内容主体*/}
				{_body}

			</View>
		);
	}
}