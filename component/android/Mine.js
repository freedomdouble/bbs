'use strict';

import React, { Component } from 'react';
import {
    View,
    Text,
    BackAndroid,
    ToastAndroid,
    AsyncStorage,
    TouchableHighlight,
    Image,
    StatusBar,
    ActivityIndicator,
    Modal,
    StyleSheet,
    Dimensions,
    ScrollView,
    RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from 'react-native-image-resizer';

const ScreenW = Dimensions.get('window').width;
const ScreenH = Dimensions.get('window').height;

export default class Mine extends Component {

    constructor(props) {

        super(props);

        this.user = null;
        this.submited = false;
        this.socket = null;

        this.state = {
            avator: 'http://ogmcbs0k8.bkt.clouddn.com/2017011999719767678670.gif',
            nickname: '点击头像登陆',
            isVisible: false,
            data: null,
            loaded: false,
            refreshing: false,
        };
    }

    componentWillMount() {
        BackAndroid.addEventListener('hardwareBackPress', this._onBackAndroid);
    }

    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this._onBackAndroid);

        this.socket.close();
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

    async _fetchAccounts() {

        const url = 'http://121.11.71.33:8081/api/user/accounts';

        console.log(url);

        try {
            let response = await fetch(url, {
                headers: {
                    'Authorization': this.user == null ? null : this.user.token
                }
            });

            var result = await response.json();
        } catch (error) {
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        this.setState({ data: result.data, refreshing: false });
    }

    async _fetchMsgCount() {

        const url = 'http://121.11.71.33:8081/api/msg/count';

        console.log(url);

        try {
            let response = await fetch(url, {
                headers: {
                    'Authorization': this.user == null ? null : this.user.token
                }
            });

            var result = await response.json();
        } catch (error) {
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {
            let data = this.state.data;
            data.msg_account = result.data;
            this.setState({ data: data });
        }
    }

    async componentDidMount() {

        // await AsyncStorage.clear();

        var user = null;
        var _this = this;

        try {
            user = await AsyncStorage.getItem('user');
            if (user !== null) {
                this.user = JSON.parse(user);
                this.setState({
                    avator: this.user.avator,
                    nickname: this.user.nickname
                });
            }
        } catch (error) {
            ToastAndroid.show('存储异常', ToastAndroid.SHORT);
        }

        this.setState({ loaded: true });

        this._fetchAccounts();

        // 以下是socket监听
        let server_url = "ws://121.11.71.33:8988";

        console.log(server_url);

        try {
            if (this.socket == null) {
                this.socket = new WebSocket(server_url);
            }

            var socket = this.socket;

            socket.onopen = function () {
                user = user == null ? null : JSON.parse(user);
                let token = user == null ? '' : user.token;
                console.log("Connected successful");
                socket.send(JSON.stringify({AUTH: token}));
            };

            socket.onmessage = function (evt) {
                console.log("Received: " + evt.data);
                if (evt.data == 'NOTIFY') {
                    _this._fetchMsgCount();
                }
            };

            socket.onerror = function (evt) {
                console.log("error");
            };

            socket.onclose = function (evt) {
                console.log("close");
            };

        } catch (e) {

            console.log(e.message);
        }

    }

    async _onRefresh() {

        try {
            const user = await AsyncStorage.getItem('user');
            if (user !== null) {
                this.user = JSON.parse(user);
                this.setState({
                    avator: this.user.avator,
                    nickname: this.user.nickname
                });
            }
        } catch (error) {
            ToastAndroid.show('存储异常', ToastAndroid.SHORT);
        }

        this._fetchAccounts();
    }

    // 头像
    _onPressAvator() {

        if (this.user == null) {
            this.props.navigation.navigate('Login');
            return;
        } else {
            this.setState({ isVisible: !this.state.isVisible });
        }
    }

    // 消息
    _onPressMsg() {
        if (this.user == null) {
            this.props.navigation.navigate('Login');
            return;
        }

        this.props.navigation.navigate('MineMsg', { callback: () => { this._fetchAccounts() } });
    }

    // 个人资料
    _onPressInfo() {

        if (this.user == null) {
            this.props.navigation.navigate('Login');
            return;
        }

        this.props.navigation.navigate('MineInfo', { callback: () => { this._onRefresh() } });
    }

    // 设置
    _onPressSet() {

        if (this.user == null) {
            this.props.navigation.navigate('Login');
            return;
        }

        this.props.navigation.navigate('MineSet');
    }

    // 拍摄照片
    _onPressTakePhoto() {

        this.setState({ isVisible: !this.state.isVisible });

        if (this.submited == true) {
            ToastAndroid.show('请勿重复操作...', ToastAndroid.SHORT);
            return;
        }

        if (this.user == null) {
            this.props.navigation.navigate('Login');
            return;
        }

        ImagePicker.openCamera({
            cropping: true
        })
            .then(image => {
                this._zipImage(image);
            });
    }

    // 选择照片
    _onPerssSelectPhoto() {

        this.setState({ isVisible: !this.state.isVisible });

        if (this.submited == true) {
            ToastAndroid.show('请勿重复操作...', ToastAndroid.SHORT);
            return;
        }

        if (this.user == null) {
            this.props.navigation.navigate('Login');
        }

        ImagePicker.openPicker({
            cropping: true,
            multiple: false
        })
            .then(image => {
                this._zipImage(image);
            });
    }

    // 压缩图片
    _zipImage(image) {

        ToastAndroid.show('正在处理图片...', ToastAndroid.SHORT);

        let format = '';

        if (image.mime == 'image/jpeg') {
            format = 'JPEG';
        } else if (image.mime == 'image/png') {
            format = 'PNG';
        } else if (image.mime == 'image/gif') {
            this._imageUp(image.path);
            return;
        } else {
            ToastAndroid.show('图片格式错误', ToastAndroid.SHORT);
            return;
        }

        // 压缩图片
        ImageResizer.createResizedImage(image.path, 768, 1024, format, 80, 0, null).then((resizedImageUri) => {
            this._imageUp(resizedImageUri, image.mime);
        }).catch((err) => {
            ToastAndroid.show('图片处理错误', ToastAndroid.SHORT);
        });
    }

    // 上传图片
    async _imageUp(uri, mine) {

        ToastAndroid.show('正在上传图片...', ToastAndroid.SHORT);

        let pos = uri.lastIndexOf('/');
        let name = uri.substr(pos + 1);

        let data = new FormData();

        data.append('image', { uri: uri, type: mine, name: name });
        data.append('tmp', 'tmp');

        const url = 'http://121.11.71.33:8081/api/qiniu/imageup';

        console.log(url);

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

        if (result.status == 0) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.props.navigation.navigate('Login');
            return;
        }
        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            return;
        }
        if (result.status == 1) {
            this._updateAvator(result.url);
        }
    }

    // 修改头像
    async _updateAvator(uri) {

        if (this.submited == true) {
            ToastAndroid.show('正在提交...', ToastAndroid.SHORT);
            return;
        }

        ToastAndroid.show('正在提交...', ToastAndroid.SHORT);

        this.submited = true;

        let data = new FormData();
        data.append('avator', uri);

        const url = 'http://121.11.71.33:8081/api/user/avator';

        console.log(url);

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

        if (result.status == -1) {
            this.submited = false;
            return;
        }

        if (result.status == 0) {
            this.props.navigation.navigate('Login');
            return;
        }

        if (result.status == 1) {
            let _user = this.user;
            _user.avator = result.avator;
            await AsyncStorage.setItem('user', JSON.stringify(_user));
            this.setState({ avator: result.avator });
            this.submited = false;
            return;
        }
    }

    render() {

        let _body = (
            <View style={{ flex: 1, backgroundColor: '#f4f4f4' }} />
        );

        if (this.state.loaded == true) {

            let msgBadge = null;

            if (this.state.data != null && this.state.data.msg_account > 0) {
                msgBadge = (
                    <Text style={{
                        marginRight: 6, color: '#fff', fontSize: 10, borderRadius: 9, backgroundColor: 'red',
                        paddingHorizontal: 6, paddingVertical: 2
                    }}>{this.state.data.msg_account}</Text>
                );
            }

            _body = (
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'column', backgroundColor: '#03c893', alignItems: 'center', justifyContent: 'center', paddingTop: 30, paddingBottom: 60 }}>
                        <TouchableHighlight style={{ backgroundColor: '#fff', borderRadius: 6 }} underlayColor="rgba(0,0,0,0.1)" onPress={() => this._onPressAvator()}>
                            <Image style={{ borderWidth: 2, borderColor: '#fff', height: 80, width: 80, borderRadius: 6 }} source={{ uri: this.state.avator }} />
                        </TouchableHighlight>
                        <Text style={{ marginTop: 10, fontSize: 14, color: '#fff' }}>{this.state.nickname}</Text>
                    </View>
                    <View style={{ height: 40, backgroundColor: 'rgba(0,0,0,0.1)', marginTop: -40 }}>
                        <View style={{ flex: 1, flexDirection: 'row', paddingVertical: 10 }}>
                            <TouchableHighlight
                                style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: '#f4f4f4' }}
                                underlayColor='rgba(0,0,0,0)'
                                onPress={() => {
                                    if (this.user == null) {
                                        this.props.navigation.navigate('Login'); return;
                                    }
                                    this.props.navigation.navigate('MineFocus', { currentTab: 0 });
                                }}
                            >
                                <Text style={{ color: '#fff', fontSize: 14 }}>关注 {this.state.data == null ? 0 : this.state.data.focus_account}</Text>
                            </TouchableHighlight>
                            <TouchableHighlight
                                style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: '#f4f4f4' }}
                                underlayColor='rgba(0,0,0,0)'
                                onPress={() => {
                                    if (this.user == null) {
                                        this.props.navigation.navigate('Login'); return;
                                    }
                                    this.props.navigation.navigate('MineFocus', { currentTab: 1 });
                                }}
                            >
                                <Text style={{ color: '#fff', fontSize: 14 }}>粉丝 {this.state.data == null ? 0 : this.state.data.fans_account}</Text>
                            </TouchableHighlight>
                            <TouchableHighlight
                                style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: '#f4f4f4' }}
                                underlayColor='rgba(0,0,0,0)'
                                onPress={() => {
                                    if (this.user == null) {
                                        this.props.navigation.navigate('Login'); return;
                                    }
                                    this.props.navigation.navigate('MineDynamics');
                                }}
                            >
                                <Text style={{ color: '#fff', fontSize: 14 }}>动态 {this.state.data == null ? 0 : this.state.data.dynamic_account}</Text>
                            </TouchableHighlight>
                            <TouchableHighlight
                                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                                underlayColor='rgba(0,0,0,0)'
                                onPress={() => {
                                    if (this.user == null) {
                                        this.props.navigation.navigate('Login'); return;
                                    }
                                    this.props.navigation.navigate('MinePosts');
                                }}
                            >
                                <Text style={{ color: '#fff', fontSize: 14 }}>帖子 {this.state.data == null ? 0 : this.state.data.posts_account}</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                    <View style={{ height: 30 }} />
                    <TouchableHighlight underlayColor="rgba(0,0,0,0.1)" onPress={() => this._onPressMsg()}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18, backgroundColor: '#fff' }}>
                            <View style={{ width: 30 }}><Icon name="ios-megaphone-outline" size={20} color="#5f9ea0" /></View>
                            <Text style={{ flex: 1, fontSize: 14, color: '#222', marginLeft: 5 }}>消息</Text>
                            {msgBadge}
                            <Icon name="ios-arrow-forward-outline" size={20} color="#E5E5E3" />
                        </View>
                    </TouchableHighlight>
                    <View style={{ height: 15 }} />
                    <TouchableHighlight underlayColor="rgba(0,0,0,0.1)" onPress={() => this._onPressInfo()}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18, backgroundColor: '#fff' }}>
                            <View style={{ width: 30 }}><Icon name="ios-contact-outline" size={20} color="#556b2f" /></View>
                            <Text style={{ flex: 1, fontSize: 14, color: '#222', marginLeft: 5 }}>个人资料</Text>
                            <Icon name="ios-arrow-forward-outline" size={20} color="#E5E5E3" />
                        </View>
                    </TouchableHighlight>
                    <View style={{ height: 15 }} />
                    <TouchableHighlight underlayColor="rgba(0,0,0,0.1)" onPress={() => this._onPressSet()}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18, backgroundColor: '#fff' }}>
                            <View style={{ width: 30 }}><Icon name="ios-settings-outline" size={20} color="#2a96d8" /></View>
                            <Text style={{ flex: 1, fontSize: 14, color: '#222', marginLeft: 5 }}>设置</Text>
                            <Icon name="ios-arrow-forward-outline" size={20} color="#E5E5E3" />
                        </View>
                    </TouchableHighlight>
                </View>
            );
        }

        return (
            <View style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
                {/* 状态栏 */}
                <StatusBar backgroundColor="#03c893" />
                {/* 主体 */}
                <ScrollView showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl enabled={true} refreshing={this.state.refreshing} onRefresh={() => this._onRefresh()} progressBackgroundColor='#eee' colors={['#ffaa66cc', '#ff00ddff']} />
                    }
                >
                    {_body}
                </ScrollView>
                {/* 底部导航栏 */}
                {/*<BottomNav name="Mine" nav={this.props.navigation} />*/}
                {/* 选择图片来源模态框 */}
                <Modal transparent={true} visible={this.state.isVisible} onRequestClose={() => this.setState({ isVisible: !this.state.isVisible })}>
                    <StatusBar backgroundColor='#000' />
                    <View style={styles.modal_overlay}>
                        <View style={{ backgroundColor: '#fff', zIndex: 1000 }}>
                            <TouchableHighlight onPress={() => { this._onPressTakePhoto() }} underlayColor="rgba(0,0,0,0.1)">
                                <Text style={styles.modal_item1}>拍摄照片</Text>
                            </TouchableHighlight>
                            <TouchableHighlight onPress={() => { this._onPerssSelectPhoto() }} underlayColor="rgba(0,0,0,0.1)">
                                <Text style={styles.modal_item2}>图库照片</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </Modal>
                {/* \选择图片来源模态框 */}
            </View>
        );
    }
}
let styles = StyleSheet.create({

    modal_overlay: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        width: ScreenW,
        height: ScreenH,
        justifyContent: 'center',
        alignItems: 'center',
    },

    modal_item1: {
        color: '#222',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#ccc',
        paddingHorizontal: 60,
        paddingVertical: 14
    },

    modal_item2: {
        color: '#222',
        paddingHorizontal: 60,
        paddingVertical: 14
    },

});