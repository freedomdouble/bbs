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
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

import ImageSizing from './ImageSizing';

const ScreenW = Dimensions.get('window').width;

export default class DynamicRow extends Component {

    constructor(props) {

        super(props);
        this.user = null;
        this.submited = false;
        this.state = { rowData: this.props.rowData };
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

    // 点赞或者评论后应该在这里获取最新数据
    async _fetchDynamicData() {

        let url = 'http://121.11.71.33:8081/api/dynamic/detail?dynamic_id=' + this.state.rowData.id;

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
            this.setState({ rowData: result.dynamic });
        }
    }

    // 这里处理点赞操作
    async _onPressLike() {

        if (this.props.user == null) {
            this.props.navigation.navigate('Login'); return;
        }

        if (this.submited == true) {
            ToastAndroid.show('正在提交...', ToastAndroid.SHORT); return;
        }

        ToastAndroid.show('正在提交...', ToastAndroid.SHORT);

        this.submited = true;

        let data = new FormData();
        data.append('dynamic_id', this.state.rowData.id);

        const url = 'http://121.11.71.33:8081/api/dynamic/like';

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
        if (this.state.rowData.address != '') {
            address = (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ color: '#53ABFC', fontSize: 12 }}>{this.state.rowData.address}</Text>
                </View>
            );
        }
        /* \定位地址 */

        /* 图片列表 */
        let _imgs = JSON.parse(this.state.rowData.imgs);

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
        this.state.rowData.likes.forEach((like, index) => {
            LikeList.push(
                <TouchableHighlight key={index} underlayColor="rgba(0,0,0,0.1)" onPress={() => { }} style={{ height: 16 }}>
                    <Text style={{ fontSize: 12, color: '#53ABFC' }}>{like.nickname}，</Text>
                </TouchableHighlight>
            );
        });
        if (LikeList.length > 0) {
            LikeListWraper = (
                <View style={{ flexDirection: 'row', backgroundColor: '#f4f4f4', marginTop: 13, padding: 4, flexWrap: 'wrap' }}>
                    {LikeList}
                </View>
            );
        }
        /* \点赞列表 */

        /* 评论列表 */
        this.state.rowData.comments.forEach((comment, index) => {
            if (comment.user_id2 == 0) {
                CommentList.push(
                    <TouchableHighlight key={index} style={{ flexDirection: 'row' }} underlayColor="rgba(0,0,0,0.1)" onPress={() => {
                        if (this.props.user == null) {
                            this.props.navigation.navigate('Login'); return;
                        }
                        this.props.callback('回复' + comment.nickname1 + '：', this.state.rowData.id, comment.id, this.props.rowID);
                    }}>
                        <Text style={{ color: '#222' }}>
                            <Text style={{ color: '#222', fontSize: 12 }}><Text style={{ color: '#53ABFC' }}>{comment.nickname1}</Text>：{comment.content}</Text>
                        </Text>
                    </TouchableHighlight>
                );
            } else {
                CommentList.push(
                    <TouchableHighlight key={index} style={{ flexDirection: 'row' }} underlayColor="rgba(0,0,0,0.1)" onPress={() => {
                        if (this.props.user == null) {
                            this.props.navigation.navigate('Login'); return;
                        }
                        this.props.callback('回复' + comment.nickname1 + '：', this.state.rowData.id, comment.id, this.props.rowID);
                    }}>
                        <Text style={{ color: '#222', fontSize: 12 }}><Text style={{ color: '#53ABFC' }}>{comment.nickname1}</Text>回复<Text style={{ color: '#53ABFC' }}>{comment.nickname2}</Text>：{comment.content}</Text>
                    </TouchableHighlight>
                );
            }
        });
        if (this.state.rowData.comment_account > 10) {
            CommentList.push(
                <TouchableHighlight key="more" underlayColor="rgba(0,0,0,0.1)" style={{ flexDirection: 'row', marginTop: 4 }} onPress={() => {
                    this.props.navigation.navigate('DynamicDetail', { id: this.state.rowData.id });
                }}>
                    <Text style={{ color: '#222', fontSize: 12 }}>查看更多>></Text>
                </TouchableHighlight>
            )
        }
        if (CommentList.length > 0) {
            CommentListWraper = (
                <View style={{ backgroundColor: '#f4f4f4', padding: 4, borderTopWidth: LikeList.length == 0 ? 0 : StyleSheet.hairlineWidth, borderColor: '#e7e6eb', marginTop: LikeList.length == 0 ? 13 : 0 }}>
                    {CommentList}
                </View>
            );
        }
        /* \评论列表 */

        return (
            <View style={{
                flex: 1, flexDirection: 'row', paddingHorizontal: 12, paddingTop: 20, marginVertical: 1,
                paddingBottom: 18, borderBottomColor: '#ccc', borderBottomWidth: StyleSheet.hairlineWidth, backgroundColor: '#fff'
            }}>
                {/*头像*/}
                <TouchableHighlight style={{ width: 44, height: 44 }} onPress={() => {
                    this.props.navigation.navigate('User', { id: this.state.rowData.user_id });
                }}>
                    <DefaulImage source={{ uri: this.state.rowData.avator }} style={{ width: 44, height: 44 }} />
                </TouchableHighlight>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    {/*昵称、发表时间*/}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#ccc', fontSize: 12 }}>{this.state.rowData.nickname}</Text>
                        <Text style={{ color: '#ccc', fontSize: 12 }}>{this.state.rowData.created}</Text>
                    </View>
                    {/*内容*/}
                    <Text style={{ color: '#222', lineHeight: 22, paddingVertical: 5, fontSize: 12 }}>{this.state.rowData.content}</Text>
                    {/*图片列表*/}
                    {ImageListWrraper}
                    {/*定位地址*/}
                    {address}
                    {/*点赞数量、评论数量*/}
                    <View style={{ flexDirection: 'row', marginTop: 7 }}>
                        <TouchableHighlight underlayColor='rgba(0,0,0,0.1)' onPress={() => this._onPressLike()}>
                            <View style={{ flexDirection: 'row' }}>
                                <Icon name="md-thumbs-up" size={16} color='#ccc' />
                                <Text style={{ fontSize: 12, color: '#ccc', marginLeft: 2, marginTop: StyleSheet.hairlineWidth }}>{this.state.rowData.like_account}</Text>
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight underlayColor='rgba(0,0,0,0.1)' style={{ marginLeft: 14 }} onPress={() => {
                            if (this.props.user == null) {
                                this.props.navigation.navigate('Login'); return;
                            }
                            this.props.callback('', this.state.rowData.id, 0, this.props.rowID);
                        }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Icon name="ios-text" size={17} color='#ccc' style={{ marginTop: 1 }} />
                                <Text style={{ fontSize: 12, color: '#ccc', marginLeft: 2, marginTop: 1.5 }}>{this.state.rowData.comment_account}</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                    {/*点赞用户头像列表*/}
                    {LikeListWraper}
                    {/*用户评论列表*/}
                    {CommentListWraper}
                </View>
            </View>
        );
    }
}