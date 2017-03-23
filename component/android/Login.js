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
    BackAndroid
} from 'react-native';
import dismissKeyboard from 'dismissKeyboard';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationActions } from 'react-navigation';

export default class Login extends Component {

    constructor(props) {

        super(props);
        this.submited = false;
        this.state = { username: '', password: '' };
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

    // 点击登陆按钮
    async _onPressLogin() {

        if (this.state.username == '') {
            ToastAndroid.show('请输入用户名', ToastAndroid.SHORT);
            return;
        }
        if (this.state.password == '') {
            ToastAndroid.show('请输入密码', ToastAndroid.SHORT);
            return;
        }

        if (this.submited == true) {
            ToastAndroid.show('正在提交数据...', ToastAndroid.SHORT);
            return;
        }

        ToastAndroid.show('正在登录...', ToastAndroid.SHORT);

        this.submited = true;

        let data = new FormData();
        data.append('username', this.state.username);
        data.append('password', this.state.password);

        const url = 'http://121.11.71.33:8081/api/user/login';

        try {
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: data
            });
            var result = await response.json();
        } catch (error) {
            this.submited = false;
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == -1) {
            this.submited = false;
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            return;
        }
        if (result.status == 1) {
            dismissKeyboard();

            try {
                await AsyncStorage.setItem('user', JSON.stringify(result.user));
            } catch (error) {
                ToastAndroid.show('存储异常', ToastAndroid.SHORT);
            }

            ToastAndroid.show(result.msg, ToastAndroid.SHORT);

            const navigationAction = NavigationActions.navigate({
                routeName: 'Home',
                params: {},
                action: NavigationActions.navigate({ routeName: 'Mine' })
            });

            this.props.navigation.dispatch(navigationAction)

            // const resetAction = NavigationActions.reset({
            //     index: 0,
            //     actions: [
            //         NavigationActions.navigate({ routeName: 'Home' }),
            //     ]
            // })

            // this.props.navigation.dispatch(resetAction);
        }
    }

    render() {

        return (
            <View style={{ flex: 1 }}>
                {/* 设置状态栏颜色 */}
                <StatusBar backgroundColor="#03c893" />
                {/* 工具栏 */}
                <View style={{ flexDirection: 'row', height: 45, paddingHorizontal: 12, alignItems: 'center', backgroundColor: '#03c893', }}>
                    <TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => { dismissKeyboard(); this.props.navigation.goBack(null); }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                            <Icon name="ios-arrow-back-outline" size={22} color="#fff" style={{ marginTop: 1 }} />
                            <Text style={{ color: '#fff', fontSize: 16, marginLeft: 7 }}>用户登录</Text>
                        </View>
                    </TouchableHighlight>
                </View>

                <View style={{ flex: 1, backgroundColor: '#f4f4f4' }}>

                    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>

                        <View style={{ height: 30 }} />

                        <View style={{ backgroundColor: '#fff' }}>
                            <TextInput
                                style={styles.inputUsername}
                                keyboardType="numeric"
                                onChangeText={(text) => this.setState({ username: text })}
                                underlineColorAndroid="rgba(0,0,0,0)"
                                placeholder="请输入手机号码"
                            />
                            <TextInput
                                style={styles.inputPassword}
                                onChangeText={(text) => this.setState({ password: text })}
                                underlineColorAndroid="rgba(0,0,0,0)"
                                secureTextEntry={true}
                                placeholder="请输入密码"
                            />
                        </View>

                        <View style={{ height: 20 }} />

                        <TouchableHighlight style={styles.loginBtn} underlayColor="rgba(0,0,0,0)" onPress={() => this._onPressLogin()}>
                            <Text style={{ color: '#fff', fontSize: 18 }}>确定登陆</Text>
                        </TouchableHighlight>

                        <View style={{ height: 14 }} />

                        <View style={{ flex: 1, flexDirection: "row", justifyContent: 'space-between', paddingHorizontal: 4 }}>
                            <TouchableHighlight
                                underlayColor="rgba(0,0,0,0)"
                                onPress={() => { dismissKeyboard(); this.props.navigation.navigate('Reg'); }}
                            >
                                <Text style={{ color: '#03c893' }}>注册用户</Text>
                            </TouchableHighlight>
                            <TouchableHighlight
                                underlayColor="rgba(0,0,0,0)"
                                onPress={() => { dismissKeyboard(); this.props.navigation.navigate('ForgetPassword'); }}
                            >
                                <Text style={{ color: '#03c893' }}>忘记密码</Text>
                            </TouchableHighlight>
                        </View>

                    </ScrollView>

                </View>

            </View>
        );
    }
}

let styles = StyleSheet.create({

    loginBtn: {
        marginHorizontal: 4,
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#03c893'
    },

    inputUsername: {
        paddingVertical: 7,
        borderColor: '#ccc',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth
    },

    inputPassword: {
        paddingVertical: 7,
        borderColor: '#ccc',
        borderBottomWidth: StyleSheet.hairlineWidth
    },
});
