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
	Modal,
	TextInput,
	BackAndroid,
	StyleSheet
} from 'react-native';
import dismissKeyboard from 'dismissKeyboard';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationActions } from 'react-navigation';

const ScreenW = Dimensions.get('window').width;

// 设置
export default class MineSet extends Component {

	constructor(props) {

		super(props);

		this.user = null;
		this.submited = false;

		this.state = { isVisible: false, text: '' };
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
	}

	// 反馈和建议
	_onPressFeedback() {

		if (this.user == null) {
			ToastAndroid.show('请先登录', ToastAndroid.SHORT);
			this.props.navigation.navigate('Login');
			return;
		}
		else {
			this.props.navigation.navigate('MineSetFeedback');
		}
	}

	// 修改密码
	_onPressPass() {

		if (this.user == null) {
			ToastAndroid.show('请先登录', ToastAndroid.SHORT);
			return;
		}

		this._setModalVisible(true);
	}

	// 退出登录
	async _onPressLogout() {

		if (this.user == null) {
			ToastAndroid.show('请先登录', ToastAndroid.SHORT);
			return;
		}

		if (this.submited == true) {
			ToastAndroid.show('正在退出登录...', ToastAndroid.SHORT);
			return;
		}

		this.submited = true;

		ToastAndroid.show('正在退出登录...', ToastAndroid.SHORT);

		const url = 'http://121.11.71.33:8081/api/user/logout';

		// 退出登录请求
		try {
			let response = await fetch(url, { headers: { 'Authorization': this.user.token } });
			var result = await response.json();
		} catch (error) {
			ToastAndroid.show('网络错误', ToastAndroid.SHORT);
			return;
		}

		if (result.status == 1) {
			// 清除本地用户信息
			try {
				await AsyncStorage.removeItem('user');
			} catch (error) {
				ToastAndroid.show('存储异常', ToastAndroid.SHORT);
			}

			ToastAndroid.show(result.msg, ToastAndroid.SHORT);

			const navigationAction = NavigationActions.navigate({
				routeName: 'Home',
				params: {},
				action: NavigationActions.navigate({ routeName: 'Mine' })
			});

			this.props.navigation.dispatch(navigationAction);
		}

		if (result.status == -1) {
			this.submited = false;
			ToastAndroid.show(result.msg, ToastAndroid.SHORT);
		}
	}

	// 设置模态框出现或者消失
	_setModalVisible(isVisible) {
		this.setState({ isVisible: isVisible });
	}

	// 取消修改密码
	_onPressCannel() {
		dismissKeyboard();
		this.setState({ text: '', isVisible: false });
	}

	// 确定修改密码
	async _onPressSubmit() {

		if (this.user == null) {
			ToastAndroid.show('请先登录', ToastAndroid.SHORT);
			return;
		}

		if (this.state.text == '') {
			ToastAndroid.show('请输入新的密码', ToastAndroid.SHORT);
			return;
		}

		if (this.submited == true) {
			ToastAndroid.show('正在提交数据...', ToastAndroid.SHORT);
			return;
		}

		this.submited = true;

		ToastAndroid.show('正在提交数据...', ToastAndroid.SHORT);

		let data = new FormData();
		data.append('password', this.state.text);

		const url = 'http://121.11.71.33:8081/api/user/passwd';

		try {
			let response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'multipart/form-data',
					'Authorization': this.user == null ? null : this.user.token
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

			// 隐藏输入键盘
			dismissKeyboard();

			try {
				await AsyncStorage.removeItem('user');
			} catch (error) {
				ToastAndroid.show('存储异常', ToastAndroid.SHORT);
			}

			this.setState({ text: '', isVisible: false });

			const navigationAction = NavigationActions.navigate({
				routeName: 'Home',
				params: {},
				action: NavigationActions.navigate({ routeName: 'Mine' })
			});

			this.props.navigation.dispatch(navigationAction)
		}
	}

	render() {

		let _this = this;

		return (
			<View style={{ flex: 1 }}>
				{/* 修改密码模态框 */}
				<Modal transparent={true} ref="modal" visible={_this.state.isVisible} onRequestClose={() => { _this._setModalVisible(false) }}>
					<StatusBar backgroundColor="#000" />
					<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', }}>
						<View style={{ backgroundColor: '#fff', zIndex: 1000, width: ScreenW * 0.7 }}>
							<Text style={{ color: '#999', paddingTop: 12, paddingHorizontal: 14, fontSize: 18 }}>修改密码</Text>
							<TextInput
								style={{ borderBottomWidth: 1, borderColor: '#ccc', height: 45, paddingHorizontal: 14 }}
								keyboardType='email-address'
								placeholderTextColor="#ccc"
								underlineColorAndroid="rgba(0,0,0,0)"
								placeholder="请输入新的密码"
								multiline={false}
								secureTextEntry={true}
								onChangeText={(text) => _this.setState({ text: text })}
								value={_this.state.text}
							/>
							<View style={{ flexDirection: 'row' }}>
								<TouchableHighlight style={{ flex: 1, alignItems: 'center', height: 50, justifyContent: 'center', borderRightWidth: 1, borderColor: '#ccc' }}
									onPress={() => _this._onPressCannel()} underlayColor="rgba(0,0,0,0.1)">
									<Text style={{ color: '#ccc', fontSize: 16 }}>取消</Text>
								</TouchableHighlight>
								<TouchableHighlight style={{ flex: 1, alignItems: 'center', height: 50, justifyContent: 'center' }}
									onPress={() => _this._onPressSubmit()} underlayColor="rgba(0,0,0,0.1)">
									<Text style={{ color: '#03c893', fontSize: 16 }}>确定</Text>
								</TouchableHighlight>
							</View>
						</View>
					</View>
				</Modal>
				{/* 设置状态栏颜色 */}
				<StatusBar backgroundColor="#03c893" />
				{/* 顶部导航栏 */}
				<View style={{ flexDirection: 'row', height: 45, paddingHorizontal: 12, alignItems: 'center', backgroundColor: '#03c893', }}>
					<TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => { _this.props.navigation.goBack(null); }}>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<Icon name="ios-arrow-back-outline" size={22} color="#fff" style={{ marginTop: 1 }} />
							<Text style={{ color: '#fff', fontSize: 16, marginLeft: 7 }}>设置</Text>
						</View>
					</TouchableHighlight>
				</View>
				{/*内容主体*/}
				<View style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
					<View style={{ height: 30 }} />
					<TouchableHighlight underlayColor="rgba(0,0,0,0.1)" onPress={() => _this._onPressFeedback()}>
						<View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18, backgroundColor: '#fff' }}>
							<View style={{ width: 30 }}><Icon name="ios-document-outline" size={20} color="#3c763d" /></View>
							<Text style={{ flex: 1, fontSize: 14, color: '#222' }}>反馈&建议</Text>
							<Icon name="ios-arrow-forward-outline" size={20} color="#E5E5E3" />
						</View>
					</TouchableHighlight>
					<View style={{ height: 15 }} />
					<TouchableHighlight underlayColor="rgba(0,0,0,0.1)" onPress={() => _this._onPressPass()}>
						<View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18, backgroundColor: '#fff' }}>
							<View style={{ width: 30 }}><Icon name="ios-build-outline" size={20} color="#ff8c00" /></View>
							<Text style={{ flex: 1, fontSize: 14, color: '#222' }}>修改密码</Text>
							<Icon name="ios-arrow-forward-outline" size={20} color="#E5E5E3" />
						</View>
					</TouchableHighlight>
					<View style={{ height: 15 }} />
					<TouchableHighlight underlayColor="rgba(0,0,0,0.1)" onPress={() => _this._onPressLogout()}>
						<View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18, backgroundColor: '#fff' }}>
							<View style={{ width: 30 }}><Icon name="md-contact" size={20} color="#dc143c" /></View>
							<Text style={{ flex: 1, fontSize: 14, color: '#222' }}>退出登录</Text>
							<Icon name="ios-arrow-forward-outline" size={20} color="#E5E5E3" />
						</View>
					</TouchableHighlight>
				</View>
			</View>
		);
	}
}