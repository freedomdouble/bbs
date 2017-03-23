'use strict';

import React, { Component } from 'react';
import {
	View,
	Text,
	StatusBar,
	TouchableHighlight,
	ScrollView,
	TextInput,
	StyleSheet,
	ToastAndroid,
	AsyncStorage,
	BackAndroid,
} from 'react-native';
import dismissKeyboard from 'dismissKeyboard';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationActions } from 'react-navigation'

export default class ForgetPassword extends Component {

	constructor(props) {

		super(props);

		this.isSubmit = false;
		this.intervaling = false;
		this.inteval = 0;

		this.state = { intervalText: '获取验证码', newPassword: '', mobile: '', code: '' };
	}

	componentWillMount() {
		BackAndroid.addEventListener('hardwareBackPress', this._onBackAndroid);
	}

	componentWillUnmount() {
		BackAndroid.removeEventListener('hardwareBackPress', this._onBackAndroid);
	}

	_onBackAndroid = () => {
		dismissKeyboard();
		this.props.navigation.goBack(null);
		return true;
	}

	// 点击确定修改按钮
	async _onPressSubmit() {

		// 判断是否输入了密码
		if (this.state.newPassword.length < 6) {
			ToastAndroid.show('密码最少包含6个字符', ToastAndroid.SHORT);
			return false;
		}
		// 判断是否输入了手机号码
		if (this.state.mobile == '') {
			ToastAndroid.show('请输入手机号码', ToastAndroid.SHORT);
			return;
		}
		// 判断是否输入了验证码
		if (this.state.code == '') {
			ToastAndroid.show('请输入验证码', ToastAndroid.SHORT);
			return;
		}

		if (this.isSubmit == true) {
			ToastAndroid.show('正在提交...', ToastAndroid.SHORT);
			return false;
		}

		ToastAndroid.show('正在提交...', ToastAndroid.SHORT);

		this.isSubmit = true;

		let data = new FormData();
		data.append('newPassword', this.state.newPassword);
		data.append('mobile', this.state.mobile);
		data.append('code', this.state.code);

		const url = 'http://121.11.71.33:8081/api/user/password';

		try {
			let response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'multipart/form-data'
				},
				body: data
			});
			var result = await response.json();
		} catch (error) {
			this.isSubmit = false;
			ToastAndroid.show('网络错误', ToastAndroid.SHORT);
			return;
		}

		if (result.status == -1) {
			ToastAndroid.show(result.msg, ToastAndroid.SHORT);
			this.isSubmit = false;
			return;
		}
		if (result.status == 1) {
			dismissKeyboard();
			clearInterval(this.inteval);
			ToastAndroid.show(result.msg, ToastAndroid.SHORT);

			// 清除本地用户信息
			try {
				await AsyncStorage.removeItem('user');
			} catch (error) {
				ToastAndroid.show('存储异常', ToastAndroid.SHORT);
			}

			const resetAction = NavigationActions.reset({
				index: 1,
				actions: [
					NavigationActions.navigate({ routeName: 'Home' }),
					NavigationActions.navigate({ routeName: 'Login' })
				]
			})

			this.props.navigation.dispatch(resetAction);
		}
	}

	// 获取验证码
	async _onPressCode() {

		if (this.intervaling == false) {

			this.intervaling = true;

			// 判断是否输入了密码
			if (this.state.newPassword.length < 6) {
				ToastAndroid.show('密码最少包含6个字符', ToastAndroid.SHORT);
				this.intervaling = false;
				return false;
			}
			// 判断是否输入了手机号码
			if (this.state.mobile == '') {
				ToastAndroid.show('请输入手机号码', ToastAndroid.SHORT);
				this.intervaling = false;
				return;
			}

			ToastAndroid.show('正在发送验证码...', ToastAndroid.SHORT);

			let data = new FormData();

			data.append('mobile', this.state.mobile);

			try {
				let response = await fetch('http://121.11.71.33:8081/api/sms/modify', {
					method: 'POST',
					headers: {
						'Content-Type': 'multipart/form-data'
					},
					body: data
				});
				var result = await response.json();
			} catch (error) {
				this.intervaling = false;
				ToastAndroid.show('网络错误', ToastAndroid.SHORT);
				return;
			}

			if (result.status == -1) {
				ToastAndroid.show(result.msg, ToastAndroid.SHORT);
				this.intervaling = false;
				return false;
			}

			if (result.status == 1) {
				ToastAndroid.show('已发送,请注意查收', ToastAndroid.SHORT);
				let timeout = result.exp;
				this.inteval = setInterval(() => {
					timeout -= 1;
					this.setState({ intervalText: timeout + '秒' });

					if (timeout == 0) {
						this.setState({ intervalText: '获取验证码' });
						clearInterval(this.inteval);
						this.intervaling = false;
					}
				}, 1000);
				return false;
			}
		}

	}

	render() {
		return (
			<View style={{ flex: 1 }}>

				{/* 设置状态栏颜色 */}
				<StatusBar backgroundColor="#03c893" />
				{/* 工具栏 */}
				<View style={{ flexDirection: 'row', height: 45, paddingHorizontal: 12, alignItems: 'center', backgroundColor: '#03c893' }}>
					<TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => { dismissKeyboard(); this.props.navigation.goBack(null); }}>
						<View style={{ flexDirection: 'row', alignItems: 'center', }}>
							<Icon name="ios-arrow-back-outline" size={22} color="#fff" style={{ marginTop: 1 }} />
							<Text style={{ color: '#fff', fontSize: 16, marginLeft: 7 }}>忘记密码</Text>
						</View>
					</TouchableHighlight>
				</View>

				<View style={{ flex: 1, backgroundColor: '#f4f4f4' }}>

					<ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>

						<View style={{ height: 30 }} />

						<View style={{ backgroundColor: '#fff' }}>

							<TextInput
								style={styles.inputStyle1}
								underlineColorAndroid="rgba(0,0,0,0)"
								secureTextEntry={true}
								placeholder="请输入新的密码"
								onChangeText={(text) => this.setState({ newPassword: text })}
							/>
							<TextInput
								style={styles.inputStyle2}
								keyboardType="numeric"
								underlineColorAndroid="rgba(0,0,0,0)"
								placeholder="请输入绑定的手机号码"
								onChangeText={(text) => this.setState({ mobile: text })}
							/>

							<View style={{ flexDirection: 'row' }}>
								<TextInput
									style={[styles.inputStyle2, { flex: 1 }]}
									keyboardType="numeric"
									underlineColorAndroid="rgba(0,0,0,0)"
									placeholder="请输入验证码，10分钟内有效"
									onChangeText={(text) => this.setState({ code: text })}
								/>
								<TouchableHighlight
									underlayColor="rgba(0,0,0,0.1)"
									style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc', backgroundColor: '#03c893', width: 90, alignItems: 'center', justifyContent: 'center' }}
									onPress={() => this._onPressCode()}
								>
									<Text style={{ color: '#fff' }}>{this.state.intervalText}</Text>
								</TouchableHighlight>
							</View>
						</View>

						<View style={{ height: 20 }} />

						<TouchableHighlight style={styles.submitBtn} underlayColor="rgba(0,0,0,0.1)" onPress={() => { this._onPressSubmit() }}>
							<Text style={{ color: '#fff', fontSize: 18 }}>确定提交</Text>
						</TouchableHighlight>

						<View style={{ height: 14 }} />

						<View style={{ flex: 1, flexDirection: "row", justifyContent: 'space-between', paddingHorizontal: 4 }}>
							<TouchableHighlight
								underlayColor="rgba(0,0,0,0)"
								onPress={() => { dismissKeyboard(); this.props.navigation.navigate('Login'); }}
							>
								<Text style={{ color: '#03c893' }}>用户登录</Text>
							</TouchableHighlight>
							<TouchableHighlight
								underlayColor="rgba(0,0,0,0)"
								onPress={() => { dismissKeyboard(); this.props.navigation.navigate('Reg'); }}
							>
								<Text style={{ color: '#03c893' }}>注册用户</Text>
							</TouchableHighlight>
						</View>

					</ScrollView>

				</View>

			</View>
		);
	}
}

let styles = StyleSheet.create({
	submitBtn: {
		marginHorizontal: 4,
		paddingVertical: 10,
		borderRadius: 5,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#03c893'
	},

	inputStyle1: {
		paddingVertical: 7,
		borderColor: '#ccc',
		borderTopWidth: StyleSheet.hairlineWidth,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderStyle: 'solid'
	},
	inputStyle2: {
		paddingVertical: 7,
		borderColor: '#ccc',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderStyle: 'solid'
	},
});
