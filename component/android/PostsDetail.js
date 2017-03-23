'use strict';

import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableHighlight,
    StatusBar,
    ScrollView,
    Image,
    ToastAndroid,
    AsyncStorage,
    ActivityIndicator,
    BackAndroid,
    StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PostsWebView from './PostsWebView';

export default class PostsDetail extends Component {

    constructor(props) {

        super(props);

        this.user = null;
        this.submited = false;

        this.state = { posts: null };
    }

    componentWillMount() {
        BackAndroid.addEventListener('hardwareBackPress', this._onBackAndroid);
    }

    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this._onBackAndroid);
    }

    _onBackAndroid = () => {
        this.props.navigation.goBack(null);
        this.props.navigation.state.params.callBack();
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

        this._fetchPostsInfo();
    }

    // 获取帖子详情
    async _fetchPostsInfo() {

        let _this = this;

        let url = 'http://121.11.71.33:8081/api/posts/detail?id=' + _this.props.navigation.state.params.id;

        try {
            let response = await fetch(url, { headers: { 'Authorization': _this.user == null ? null : _this.user.token } });
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
            _this.setState({ posts: result.posts });
        }
    }

    // 添加关注 | 取消关注
    async _focus(user_id) {

        let _this = this;

        if (_this.submited == true) {
            ToastAndroid.show('正在提交数据...', ToastAndroid.SHORT);
            return;
        }

        ToastAndroid.show('提交数据...', ToastAndroid.SHORT);

        _this.submited = true;

        let data = new FormData();
        data.append('user_id', user_id);
        data.append('focus', _this.state.posts.is_focus);

        try {
            let response = await fetch('http://121.11.71.33:8081/api/user/focus', {
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

        _this.submited = false;

        ToastAndroid.show(result.msg, ToastAndroid.SHORT);

        if (result.status == 0) {
            _this.props.navigation.navigate('Login');
            return;
        }
        if (result.status == 1) {
            let posts = _this.state.posts;
            posts.is_focus = posts.is_focus == 1 ? 0 : 1;
            _this.setState({ posts: posts });
        }
    }

    render() {

        let _this = this;
        let _body = null;
        let _bottom = null;

        if (_this.state.posts == null) {
            _body = (
                <View style={{ flex: 1, backgroundColor: '#f4f4f4', alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator
                        animating={true}
                        size="large"
                        color="#03c893"
                    />
                </View>
            );
        }
        else {
            let focusText = _this.state.posts.is_focus == 1 ? '取消关注' : '添加关注';

            _body = (
                <ScrollView showsVerticalScrollIndicator={true} showsHorizontalScrollIndicator={false}>
                    <View style={{ backgroundColor: '#fff', paddingHorizontal: 12 }}>
                        <View style={{ flexDirection: 'column', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc' }}>
                            {/*标题*/}
                            <Text style={{ color: '#222', fontSize: 18, lineHeight: 32, paddingVertical: 13 }}>{_this.state.posts.title}</Text>
                            {/*发布时间、所属分类、来源*/}
                            <View style={{ flexDirection: 'row', paddingVertical: 13 }}>
                                <Text style={{ color: '#ccc', fontSize: 12 }}>{_this.state.posts.created}</Text>
                                <Text style={{ color: '#ccc', fontSize: 12, marginLeft: 8 }}>{_this.state.posts.cate_name}</Text>
                                <Text style={{ color: '#ccc', fontSize: 12, marginLeft: 8 }}>{_this.state.posts.source}</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row', paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc' }}>
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                {/*发布人头像*/}
                                <TouchableHighlight
                                    underlayColor="rgba(0,0,0,0.1)"
                                    onPress={() => { _this.props.navigation.navigate('User', { id: _this.state.posts.user_id }); }}
                                >
                                    <Image style={{ height: 38, width: 38 }} source={{ uri: _this.state.posts.avator }} />
                                </TouchableHighlight>
                                {/*昵称、关注按钮*/}
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 8 }}>
                                    <View style={{ flex: 1 }}><Text style={{ color: '#222', fontSize: 14 }}>{_this.state.posts.nickname}</Text></View>
                                    <TouchableHighlight
                                        underlayColor="rgba(0,0,0,0.1)"
                                        onPress={() => { _this._focus(_this.state.posts.user_id) }}
                                        style={{ backgroundColor: '#03c893', borderRadius: 2, height: 18, paddingHorizontal: 3, justifyContent: 'center' }}
                                    >
                                        <Text style={{ fontSize: 12, color: '#fff' }}>{focusText}</Text>
                                    </TouchableHighlight>
                                </View>
                            </View>
                        </View>
                    </View>
                    {/*帖子内容*/}
                    <View style={{ flex: 1 }}>
                        <PostsWebView webContent={_this.state.posts.content} />
                    </View>

                </ScrollView>
            );

            _bottom = (
                <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#ddd' }}>
                    <TouchableHighlight
                        underlayColor="rgba(0,0,0,0.1)"
                        style={{ flex: 1 }}
                        onPress={() => {
                            _this.props.navigation.navigate('PostsComments', { id: _this.props.navigation.state.params.id, callBack: () => { _this._fetchPostsInfo() } });
                        }}
                    >
                        <View style={{ flexDirection: 'row', height: 50, justifyContent: 'center', alignItems: 'center', borderColor: '#ddd', borderRightWidth: StyleSheet.hairlineWidth }}>
                            <Text style={{ marginLeft: 5, color: '#888' }}>{_this.state.posts.comment_account == 0 ? '暂无' : _this.state.posts.comment_account + '条'}评论</Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight
                        underlayColor="rgba(0,0,0,0.1)"
                        style={{ flex: 1 }}
                        onPress={() => {
                            if (_this.user == null) {
                                _this.props.navigation.navigate('Login');
                                return;
                            }
                            _this.props.navigation.navigate('PostsComment', { posts_id: _this.props.navigation.state.params.id, parent_id: 0, callBack: () => { _this._fetchPostsInfo() } });
                        }}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'center', height: 50, alignItems: 'center' }}>
                            <Icon name="ios-text-outline" size={22} color="#888" style={{ marginTop: -1 }} />
                            <Text style={{ marginLeft: 5, color: '#888' }}>去评论</Text>
                        </View>
                    </TouchableHighlight>
                </View>
            );
        }

        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    {/* 头部 */}
                    <View>
                        {/* 状态栏 */}
                        <StatusBar backgroundColor="#03c893" barStyle="light-content" />
                        {/* 工具栏 */}
                        <View style={{ flexDirection: 'row', height: 45, paddingHorizontal: 12, alignItems: 'center', backgroundColor: '#03c893', }}>
                            <TouchableHighlight underlayColor="rgba(0,0,0,0)"
                                onPress={() => { _this.props.navigation.goBack(null); _this.props.navigation.state.params.callBack(); }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                    <Icon name="ios-arrow-back-outline" size={22} color="#fff" style={{ marginTop: 1 }} />
                                    <Text style={{ color: '#fff', fontSize: 16, marginLeft: 7 }}>帖子详情</Text>
                                </View>
                            </TouchableHighlight>
                        </View>
                    </View>
                    {/*内容主体*/}
                    {_body}
                </View>
                {_bottom}
            </View>
        );
    }
}
