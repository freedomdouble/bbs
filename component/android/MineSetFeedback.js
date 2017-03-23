'use strict'

import React, { Component } from 'react';
import {
    View,
    StatusBar,
    Text,
    TouchableHighlight,
    ScrollView,
    TextInput,
    ToastAndroid,
    AsyncStorage,
    BackAndroid
} from 'react-native';
import dismissKeyboard from 'dismissKeyboard';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationActions } from 'react-navigation';

export default class MineSetFeedback extends Component {

    constructor(props) {

        super(props);

        this.submited = false;
        this.user = null;

        this.state = { content: '' };
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
    }

    // 提交数据
    async _onPressSubmit() {

        let _this = this;

        if (_this.submited == true) {
            ToastAndroid.show('正在提交...', ToastAndroid.SHORT);
            return;
        }

        ToastAndroid.show('正在提交...', ToastAndroid.SHORT);

        _this.submited = true;

        let data = new FormData();
        data.append('content', _this.state.content);

        try {
            let response = await fetch('http://121.11.71.33:8081/api/user/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': _this.user == null ? null : _this.user.token
                },
                body: data
            });

            var result = await response.json();
        } catch (error) {
            _this.submited = false;
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        ToastAndroid.show(result.msg, ToastAndroid.SHORT);

        if (result.status == -1) {
            _this.submited = false;
            return;
        }
        if (result.status == 0) {
            _this.props.navigation.navigate('Login');
            return;
        }
        if (result.status == 1) {
            dismissKeyboard();
            const navigationAction = NavigationActions.navigate({
                routeName: 'Home',
                params: {},
                action: NavigationActions.navigate({ routeName: 'Mine' })
            });

            this.props.navigation.dispatch(navigationAction);
            return;
        }
    }

    render() {

        let _this = this;

        return (

            <View style={{ flex: 1, backgroundColor: '#E5E5E3' }}>
                {/* 设置状态栏颜色 */}
                <StatusBar backgroundColor="#03c893" />
                {/* 顶部导航栏 */}
                <View style={{ flexDirection: 'row', height: 45, paddingHorizontal: 12, alignItems: 'center', backgroundColor: '#03c893', }}>
                    <TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => { dismissKeyboard(); _this.props.navigation.goBack(null); }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="ios-arrow-back-outline" size={22} color="#fff" style={{ marginTop: 1 }} />
                            <Text style={{ color: '#fff', fontSize: 16, marginLeft: 7 }}>反馈&建议</Text>
                        </View>
                    </TouchableHighlight>
                </View>
                <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                    <View style={{ height: 20 }} />
                    <View style={{ paddingHorizontal: 5, backgroundColor: '#E5E5E3' }}>
                        <TextInput
                            style={{ fontSize: 14, backgroundColor: '#fff', borderRadius: 5 }}
                            placeholderTextColor="#ccc"
                            underlineColorAndroid="rgba(0,0,0,0)"
                            placeholder="您的反馈和建议对我们很重要..."
                            multiline={true}
                            numberOfLines={7}
                            onChangeText={(text) => _this.setState({ content: text })}
                            value={_this.state.content}
                        />
                    </View>
                    <View style={{ height: 20 }} />
                    <TouchableHighlight
                        style={{ marginHorizontal: 4, paddingVertical: 10, borderRadius: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: '#03c893' }}
                        underlayColor="rgba(0,0,0,0)"
                        onPress={() => this._onPressSubmit()}>
                        <Text style={{ color: '#fff', fontSize: 18 }}>确定提交</Text>
                    </TouchableHighlight>
                </ScrollView>

            </View>
        );
    }
}
