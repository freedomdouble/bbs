'use strict';

import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableHighlight,
    Image as DefaulImage,
    StyleSheet,
    Dimensions,
    AsyncStorage,
    ToastAndroid,
    ActivityIndicator,
    BackAndroid,
    StatusBar,
    ScrollView,
    Modal,
    TextInput
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

import ImageSizing from './ImageSizing';

const ScreenW = Dimensions.get('window').width;

export default class DynamicDetail extends Component {

    constructor(props) {

        super(props);
        this.user = null;
        this.submited = false;
        this.state = { dynamic: null, dynamicData: { content: '', dynamic_id: 0, parent_id: 0 }, visible: false, wasReplyNickname: '' };
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

        this._fetchDynamicData();
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

    async _fetchDynamicData() {

        let url = 'http://121.11.71.33:8081/api/dynamic/detail?flag=all&dynamic_id=' + this.props.navigation.state.params.id;

        console.log(url);

        try {
            let response = await fetch(url);
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
            this.setState({ dynamic: result.dynamic });
        }
    }

    // 提交评论
    async _onPressComment() {

        if (this.submited == true) {
            ToastAndroid.show('正在提交...', ToastAndroid.SHORT); return;
        }

        ToastAndroid.show('正在提交...', ToastAndroid.SHORT);

        this.submited = true;

        let data = new FormData();
        data.append('content', this.state.dynamicData.content);
        data.append('dynamic_id', this.state.dynamicData.dynamic_id);
        data.append('parent_id', this.state.dynamicData.parent_id);

        const url = 'http://121.11.71.33:8081/api/dynamic/comment';

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

        if (result.status == 1) {
            this._fetchDynamicData();
            this.setState({ visible: !this.state.visible });
            this.submited = false;
            return;
        }
    }

    // 这里处理点赞操作
    async _onPressLike() {

        if (this.user == null) {
            this.props.navigation.navigate('Login'); return;
        }

        if (this.submited == true) {
            ToastAndroid.show('正在提交...', ToastAndroid.SHORT); return;
        }

        ToastAndroid.show('正在提交...', ToastAndroid.SHORT);

        this.submited = true;

        let data = new FormData();
        data.append('dynamic_id', this.state.dynamic.id);

        const url = 'http://121.11.71.33:8081/api/dynamic/like';

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

        if (result.status == 1) {
            this._fetchDynamicData();
            this.submited = false;
            return;
        }
    }

    render() {

        if (this.state.dynamic == null) {

            return (
                <View style={{ flex: 1, backgroundColor: '#f4f4f4', alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator animating={true} size="large" color="#03c893" />
                </View>
            );
        }

        // 点赞用户头像尺寸
        let LikeAvatorSize = (ScreenW - 8) / 15;
        // 图片尺寸
        let ImageSize = (ScreenW - 100) / 3;
        // 图片列表
        let ImageListWrraper = null;
        let ImageList = [];
        // 点赞列表
        let LikeListWraper = null;
        let LikeList = [];
        // 评论列表
        let CommentListWraper = null;
        let CommentList = [];
        // 定位地址
        let address = null;

        /* 定位地址 */
        if (this.state.dynamic.address != '') {
            address = (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ color: '#53ABFC', fontSize: 12 }}>{this.state.dynamic.address}</Text>
                </View>
            );
        }
        /* \定位地址 */

        /* 图片列表 */
        let _imgs = JSON.parse(this.state.dynamic.imgs);

        _imgs.forEach((img, index) => {
            if (_imgs.length == 1) {
                ImageList.push(
                    <TouchableHighlight key={index} underlayColor='rgba(0,0,0,0.1)' onPress={() => {
                        this.props.navigation.navigate('ImageView', { images: _imgs, currPos: index });
                    }}>
                        <View style={{ marginBottom: 2 }}>
                            <ImageSizing uri={img} width={ImageSize * 2 + 2} height={ImageSize * 2 + 30} />
                        </View>
                    </TouchableHighlight>
                );
            } else {
                ImageList.push(
                    <TouchableHighlight key={index}
                        style={{ marginRight: 2, marginBottom: 2, width: ImageSize, height: ImageSize }} underlayColor='rgba(0,0,0,0.1)'
                        onPress={() => {
                            this.props.navigation.navigate('ImageView', { images: _imgs, currPos: index });
                        }}>
                        <DefaulImage source={{ uri: img }} style={{ width: ImageSize, height: ImageSize }} stretch='stretch' />
                    </TouchableHighlight>
                );
            }
        });
        if (ImageList.length > 0) {
            if (ImageList.length == 4) {
                ImageListWrraper = (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: ImageSize * 3, marginBottom: 5, marginTop: 7 }}>
                        {ImageList}
                    </View>
                );
            } else {
                ImageListWrraper = (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5, marginTop: 7 }}>
                        {ImageList}
                    </View>
                );
            }
        }
        /* \图片列表 */

        /* 点赞列表 */
        this.state.dynamic.likes.forEach((like, index) => {
            LikeList.push(
                <TouchableHighlight key={index} underlayColor="rgba(0,0,0,0.1)" onPress={() => { }} style={{ height: 16 }}>
                    <Text style={{ fontSize: 12, color: '#53ABFC' }}>{like.nickname}，</Text>
                </TouchableHighlight>
            );
        });
        if (LikeList.length > 0) {
            LikeListWraper = (
                <View style={{ flexDirection: 'row', backgroundColor: '#eee', marginTop: 13, padding: 4, flexWrap: 'wrap' }}>
                    {LikeList}
                </View>
            );
        }
        /* \点赞列表 */

        /* 评论列表 */
        this.state.dynamic.comments.forEach((comment, index) => {
            if (comment.user_id2 == 0) {
                CommentList.push(
                    <TouchableHighlight key={index} style={{ flexDirection: 'row' }} underlayColor="rgba(0,0,0,0.1)" onPress={() => {
                        if (this.user == null) {
                            this.props.navigation.navigate('Login'); return;
                        }
                        let dynamicData = this.state.dynamicData;
                        dynamicData.content = '';
                        dynamicData.dynamic_id = this.state.dynamic.id;
                        dynamicData.parent_id = comment.id;
                        this.setState({ dynamicData: dynamicData, wasReplyNickname: '回复' + comment.nickname1 + '：', visible: !this.state.visible });
                    }}>
                        <Text style={{ color: '#222' }}>
                            <Text style={{ color: '#222', fontSize: 12 }}><Text style={{ color: '#53ABFC' }}>{comment.nickname1}</Text>：{comment.content}</Text>
                        </Text>
                    </TouchableHighlight>
                );
            } else {
                CommentList.push(
                    <TouchableHighlight key={index} style={{ flexDirection: 'row' }} underlayColor="rgba(0,0,0,0.1)" onPress={() => {
                        if (this.user == null) {
                            this.props.navigation.navigate('Login'); return;
                        }
                        let dynamicData = this.state.dynamicData;
                        dynamicData.content = '';
                        dynamicData.dynamic_id = this.state.dynamic.id;
                        dynamicData.parent_id = comment.id;
                        this.setState({ dynamicData: dynamicData, wasReplyNickname: '回复' + comment.nickname1 + '：', visible: !this.state.visible });
                    }}>
                        <Text style={{ color: '#222', fontSize: 12 }}><Text style={{ color: '#53ABFC' }}>{comment.nickname1}</Text>回复<Text style={{ color: '#53ABFC' }}>{comment.nickname2}</Text>：{comment.content}</Text>
                    </TouchableHighlight>
                );
            }
        });
        if (CommentList.length > 0) {
            CommentListWraper = (
                <View style={{ backgroundColor: '#eee', padding: 4, borderTopWidth: LikeList.length == 0 ? 0 : StyleSheet.hairlineWidth, borderColor: '#ccc', marginTop: LikeList.length == 0 ? 13 : 0 }}>
                    {CommentList}
                </View>
            );
        }
        /* \评论列表 */

        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                {/* 设置状态栏颜色 */}
                <StatusBar backgroundColor="#03c893" translucent={false} />
                {/* 顶部导航栏 */}
                <View style={{ flexDirection: 'row', height: 45, paddingHorizontal: 12, alignItems: 'center', backgroundColor: '#03c893' }}>
                    <TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => { this.props.navigation.goBack(null); }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="ios-arrow-back-outline" size={22} color="#fff" style={{ marginTop: 1 }} />
                            <Text style={{ color: '#fff', fontSize: 16, marginLeft: 7 }}>动态详情</Text>
                        </View>
                    </TouchableHighlight>
                </View>
                <ScrollView>
                    <View style={{ flex: 1, flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 30 }}>
                        {/*头像*/}
                        <TouchableHighlight underlayColor='rgba(0,0,0,0.1)' style={{ width: 44, height: 44 }}
                            onPress={() => this.props.navigation.navigate('User', { id: this.state.dynamic.user_id })}>
                            <DefaulImage source={{ uri: this.state.dynamic.avator }} style={{ width: 44, height: 44 }} />
                        </TouchableHighlight>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            {/*昵称、发表时间*/}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ color: '#ccc', fontSize: 12 }}>{this.state.dynamic.nickname}</Text>
                                <Text style={{ color: '#ccc', fontSize: 12 }}>{this.state.dynamic.created}</Text>
                            </View>
                            {/*内容*/}
                            <Text style={{ color: '#222', lineHeight: 22, paddingVertical: 5, fontSize: 12 }}>{this.state.dynamic.content}</Text>
                            {/*图片列表*/}
                            {ImageListWrraper}
                            {/*定位地址*/}
                            {address}
                            {/*点赞数量、评论数量*/}
                            <View style={{ flexDirection: 'row', marginTop: 7 }}>
                                <TouchableHighlight underlayColor='rgba(0,0,0,0.1)' onPress={() => this._onPressLike()}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Icon name="md-thumbs-up" size={16} color='#ccc' />
                                        <Text style={{ fontSize: 12, color: '#ccc', marginLeft: 2, marginTop: 0.5 }}>{this.state.dynamic.like_account}</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight underlayColor='rgba(0,0,0,0.1)' style={{ marginLeft: 14 }} onPress={() => {
                                    if (this.user == null) {
                                        this.props.navigation.navigate('Login'); return;
                                    }
                                    let dynamicData = this.state.dynamicData;
                                    dynamicData.content = '';
                                    dynamicData.dynamic_id = this.state.dynamic.id;
                                    dynamicData.parent_id = 0;
                                    this.setState({ dynamicData: dynamicData, wasReplyNickname: '', visible: !this.state.visible });
                                }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Icon name="ios-text" size={17} color='#ccc' style={{ marginTop: 1 }} />
                                        <Text style={{ fontSize: 12, color: '#ccc', marginLeft: 2, marginTop: 1.5 }}>{this.state.dynamic.comment_account}</Text>
                                    </View>
                                </TouchableHighlight>
                            </View>
                            {/*点赞用户头像列表*/}
                            {LikeListWraper}
                            {/*用户评论列表*/}
                            {CommentListWraper}
                        </View>
                    </View>
                </ScrollView>
                {/* 评论模态框 */}
                <Modal transparent={true} ref="modal" visible={this.state.visible} onRequestClose={() => this.setState({ visible: !this.state.visible })}>
                    <StatusBar backgroundColor="#000" />
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }}>
                        <View style={{ flexDirection: 'row', backgroundColor: '#fff', width: ScreenW, zIndex: 1000, position: 'absolute', bottom: 0 }}>
                            <TextInput
                                style={{ flex: 1, height: 55, paddingHorizontal: 12 }}
                                placeholderTextColor="#ccc"
                                underlineColorAndroid="rgba(0,0,0,0)"
                                placeholder={this.state.wasReplyNickname == '' ? '请输入评论内容' : this.state.wasReplyNickname}
                                autoFocus={true}
                                multiline={true}
                                secureTextEntry={false}
                                onChangeText={(text) => {
                                    let dynamicData = this.state.dynamicData;
                                    dynamicData.content = text;
                                    this.setState({ dynamicData: dynamicData });
                                }}
                                value={this.state.text}
                            />
                            <TouchableHighlight style={{ alignItems: 'center', height: 55, justifyContent: 'center', backgroundColor: '#03c893', paddingHorizontal: 12 }}
                                onPress={() => this._onPressComment()} underlayColor="rgba(0,0,0,0.1)">
                                <Text style={{ color: '#fff', fontSize: 16 }}>确定</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }
}