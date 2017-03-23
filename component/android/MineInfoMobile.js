'use strict';

import React, { Component } from 'react';
import {
	View,
	Text,
	StatusBar,
	TouchableHighlight,
	ScrollView,
	Dimensions,
	TextInput,
	StyleSheet,
	ToastAndroid,
	AsyncStorage,
	BackAndroid
} from 'react-native';
import dismissKeyboard from 'dismissKeyboard';
import Icon from 'react-native-vector-icons/Ionicons';

export default class MineInfoMobile extends Component {

	constructor(props) {

		super(props);

		this.isSumbit = false;
		this.intervaling = false;
		this.inteval = 0;
		this.user = null;

		this.state = { intervalText: '获取验证码', curMobile: '', newMobile: '', code: '' };
	}

	componentWillMount() {
		BackAndroid.addEventListener('hardwareBackPress', this._onBackAndroid);
	}

	componentWillUnmount() {
		BackAndroid.removeEventListener('hardwareBackPress', this._onBackAndroid);
	}

	_onBackAndroid = () => {
		dismissKeyboard();
		this.props.navigation.goBack();
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

	async _onPressSubmit() {

		if (this.state.curMobile == '') {
			ToastAndroid.show('请输入当前手机号码', ToastAndroid.SHORT);
			return;
		}
		if (this.state.newMobile == '') {
			ToastAndroid.show('请输入新的手机号码', ToastAndroid.SHORT);
			return;
		}
		if (this.state.code == '') {
			ToastAndroid.show('请输入验证码', ToastAndroid.SHORT);
			return;
		}

		if (this.isSumbit == true) {
			ToastAndroid.show('正在提交...', ToastAndroid.SHORT);
			return;
		}

		ToastAndroid.show('正在提交...', ToastAndroid.SHORT);

		this.isSumbit = true;

		let data = new FormData();
		data.append('curMobile', this.state.curMobile);
		data.append('newMobile', this.state.newMobile);
		data.append('code', this.state.code);

		const url = 'http://121.11.71.33:8081/api/user/mobile';

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
			this.isSumbit = false;
			return;
		};

		if (result.status == 0) {
			ToastAndroid.show(result.msg, ToastAndroid.SHORT);
			this.isSumbit = false;
		}
		if (result.status == -1) {
			ToastAndroid.show(result.msg, ToastAndroid.SHORT);
			this.isSumbit = false;
		}
		if (result.status == 1) {
			dismissKeyboard();
			clearInterval(this.inteval);
			ToastAndroid.show(result.msg, ToastAndroid.SHORT);
			this.props.navigation.state.params.callback();
			this.props.navigation.goBack(null);
		}
	}

	// 获取验证码
	async _onPressCode() {

		if (this.user == null) {
			ToastAndroid.show('请先登录', ToastAndroid.SHORT);
			return;
		}

		if (this.state.curMobile == '') {
			ToastAndroid.show('请输入当前手机号码', ToastAndroid.SHORT);
			return;
		}

		if (this.state.newMobile == '') {
			ToastAndroid.show('请输入新的手机号码', ToastAndroid.SHORT);
			return;
		}

		if (this.intervaling == false) {

			ToastAndroid.show('正在发送验证码...', ToastAndroid.SHORT);

			this.intervaling = true;

			let data = new FormData();
			data.append('curMobile', this.state.curMobile);
			data.append('newMobile', this.state.newMobile);

			const url = 'http://121.11.71.33:8081/api/sms/bind';

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
				this.intervaling = false;
				ToastAndroid.show('网络错误', ToastAndroid.SHORT);
				return;
			}

			if (result.status == 0) {
				ToastAndroid.show(result.msg, ToastAndroid.SHORT);
				this.intervaling = false;
				return;
			}

			if (result.status == -1) {
				ToastAndroid.show(result.msg, ToastAndroid.SHORT);
				this.intervaling = false;
				return;
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
			}
		}
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				{/* 设置状态栏颜色 */}
				<StatusBar backgroundColor="#03c893" />
				{/* 顶部导航栏 */}
				<View style={{ flexDirection: 'row', height: 45, paddingHorizontal: 12, alignItems: 'center', backgroundColor: '#03c893', }}>
					<TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => { dismissKeyboard(); this.props.navigation.goBack(null); }}>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<Icon name="ios-arrow-back-outline" size={22} color="#fff" style={{ marginTop: 1 }} />
							<Text style={{ color: '#fff', fontSize: 16, marginLeft: 7 }}>手机绑定修改</Text>
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
								keyboardType="numeric"
								placeholder="请输入当前手机号码"
								onChangeText={(text) => this.setState({ curMobile: text })}
							/>
							<TextInput
								style={styles.inputStyle2}
								underlineColorAndroid="rgba(0,0,0,0)"
								keyboardType="numeric"
								placeholder="请输入新的手机号码"
								onChangeText={(text) => this.setState({ newMobile: text })}
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
						<TouchableHighlight style={styles.modifyBtn} underlayColor="rgba(0,0,0,0.1)" onPress={() => { this._onPressSubmit() }}>
							<Text style={{ color: '#fff', fontSize: 18 }}>确定修改</Text>
						</TouchableHighlight>
					</ScrollView>
				</View>
			</View>
		);
	}
}

let styles = StyleSheet.create({
	modifyBtn: {
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
		borderBottomWidth: StyleSheet.hairlineWidth
	},
	inputStyle2: {
		paddingVertical: 7,
		borderColor: '#ccc',
		borderBottomWidth: StyleSheet.hairlineWidth
	},
});
