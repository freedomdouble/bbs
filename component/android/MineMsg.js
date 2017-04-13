'use strict'

import React, { Component } from 'react';
import {
    View,
    Text,
    StatusBar,
    TouchableHighlight,
    BackAndroid,
    Animated,
    FlatList,
    ToastAndroid,
    AsyncStorage,
    Image,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LoadMore3 from './LoadMore3';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default class MineMsg extends Component {

    constructor(props) {

        super(props);
        this.user = null;
        this.page = 1;
        this.isPageEnd = false;
        this.state = { listData: [], loadMoreFlag: 0, isNetDown: false };
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

        this._fetchListData();
    }

    componentWillMount() {
        BackAndroid.addEventListener('hardwareBackPress', this._onBackAndroid);
    }

    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this._onBackAndroid);
    }

    _onBackAndroid = () => {
        this.props.navigation.state.params.callback()
        this.props.navigation.goBack(null);
        return true;
    }

    async _fetchListData() {
        const url = 'http://121.11.71.33:8081/api/msg/user?page=' + this.page;

        console.log(url);

        try {
            let response = await fetch(url, { headers: { 'Authorization': this.user == null ? null : this.user.token } });
            var result = await response.json();
        } catch (error) {
            this.setState({ isNetDown: true });
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == 0) {
            this.props.navigation.navigate('Login');
            return;
        }

        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.isPageEnd = true;
            this.setState({ loadMoreFlag: 0, listData: [] });
            return;
        }

        let loadMoreFlag = 0;

        if (result.list.length < 20) {
            this.isPageEnd = true;
            loadMoreFlag = 2;
        }

        this.page += 1;

        this.setState({ listData: this.state.listData.concat(result.list), loadMoreFlag: loadMoreFlag, isNetDown: false });
    }

    _renderItem = ({ item }) => {
        if (item.type == 0) {
            let wrapper = null;
            if (item.wrapper.type == 'image') {
                wrapper = (
                    <View>
                        <Image resizeMode="stretch" style={{ height: 63, width: 63 }} source={{ uri: item.wrapper.data }} />
                    </View>
                );
            }
            if (item.wrapper.type == 'text') {
                wrapper = (
                    <View style={{ width: 63, height: 63, backgroundColor: '#eee', justifyContent: 'center', padding: 1 }}>
                        <Text numberOfLines={4} style={{ fontSize: 12, textAlign: 'center' }}>{item.wrapper.data}</Text>
                    </View>
                );
            }
            if (item.cate == 0) {
                return (
                    <TouchableHighlight underlayColor="rgba(0,0,0,0.1)" onPress={() => {
                        this.props.navigation.navigate('DynamicDetail', { id: item.associated_id });
                    }}>
                        <View style={{ flexDirection: 'row', backgroundColor: '#fff', padding: 12 }}>
                            <Image style={{ height: 38, width: 38 }} source={{ uri: item.avator }} />
                            <View style={{ flex: 1, paddingHorizontal: 7 }}>
                                <Text style={{ color: '#222', fontSize: 14 }}>{item.nickname}</Text>
                                <Icon name="md-thumbs-up" size={22} color="#03c893" />
                                <Text style={{ color: '#ccc', fontSize: 12, lineHeight: 22 }}>{item.created}</Text>
                            </View>
                            {wrapper}
                        </View>
                    </TouchableHighlight>
                );
            }
            else if (item.cate == 1) {
                return (
                    <TouchableHighlight underlayColor="rgba(0,0,0,0.1)" onPress={() => {
                        this.props.navigation.navigate('DynamicDetail', { id: item.associated_id });
                    }}>
                        <View style={{ flexDirection: 'row', backgroundColor: '#fff', padding: 12 }}>
                            <Image style={{ height: 38, width: 38 }} source={{ uri: item.avator }} />
                            <View style={{ flex: 1, paddingHorizontal: 7 }}>
                                <Text style={{ color: '#222', fontSize: 14 }}>{item.nickname}</Text>
                                <Text style={{ color: '#222', fontSize: 12, lineHeight: 22 }}>{item.content}</Text>
                                <Text style={{ color: '#ccc', fontSize: 12, lineHeight: 22 }}>{item.created}</Text>
                            </View>
                            {wrapper}
                        </View>
                    </TouchableHighlight>
                );
            }
            else if (item.cate == 2) {
                return (
                    <TouchableHighlight underlayColor="rgba(0,0,0,0.1)" onPress={() => {
                        this.props.navigation.navigate('DynamicDetail', { id: item.associated_id });
                    }}>
                        <View style={{ flexDirection: 'row', backgroundColor: '#fff', padding: 12 }}>
                            <Image style={{ height: 38, width: 38 }} source={{ uri: item.avator }} />
                            <View style={{ flex: 1, paddingHorizontal: 7 }}>
                                <Text style={{ color: '#222', fontSize: 14 }}>{item.nickname}</Text>
                                <Text style={{ color: '#222', fontSize: 12, lineHeight: 22 }}>回复<Text style={{ color: '#53ABFC' }}>{item.reply_nickname}</Text>：{item.content}</Text>
                                <Text style={{ color: '#ccc', fontSize: 12, lineHeight: 22 }}>{item.created}</Text>
                            </View>
                            {wrapper}
                        </View>
                    </TouchableHighlight>
                );
            }
            else {
                return false;
            }
        }
        else if (item.type == 1) {
            if (item.cate == 1) {
                return (
                    <TouchableHighlight
                        underlayColor="rgba(0,0,0,0)"
                        onPress={() => {
                            this.props.navigation.navigate('PostsDetail', { id: item.associated_id, callBack: () => { } });
                        }}
                    >
                        <View style={{ flexDirection: 'row', backgroundColor: '#fff', padding: 12 }}>
                            <Image style={{ height: 38, width: 38 }} source={{ uri: item.avator }} />
                            <View style={{ flex: 1, paddingLeft: 7 }}>
                                <Text style={{ color: '#222', fontSize: 14 }}>{item.nickname}</Text>
                                <Text style={{ color: '#222', fontSize: 12, lineHeight: 22 }}>{item.content}</Text>
                                <Text style={{ color: '#ccc', fontSize: 12, lineHeight: 22 }}>{item.title}</Text>
                                <Text style={{ color: '#ccc', fontSize: 12, lineHeight: 22 }}>{item.created}</Text>
                            </View>
                        </View>
                    </TouchableHighlight>
                );
            }
            else if (item.cate == 2) {
                return (
                    <TouchableHighlight
                        underlayColor="rgba(0,0,0,0)"
                        onPress={() => {
                            this.props.navigation.navigate('PostsDetail', { id: item.associated_id, callBack: () => { } });
                        }}
                    >
                        <View style={{ flexDirection: 'row', backgroundColor: '#fff', padding: 12 }}>
                            <Image style={{ height: 38, width: 38 }} source={{ uri: item.avator }} />
                            <View style={{ flex: 1, paddingLeft: 7 }}>
                                <Text style={{ color: '#222', fontSize: 14 }}>{item.nickname}</Text>
                                <Text style={{ color: '#222', fontSize: 12, lineHeight: 22 }}>回复<Text style={{ color: '#53ABFC' }}>{item.reply_nickname}</Text>：{item.content}</Text>
                                <Text style={{ color: '#ccc', fontSize: 12, lineHeight: 22 }}>{item.title}</Text>
                                <Text style={{ color: '#ccc', fontSize: 12, lineHeight: 22 }}>{item.created}</Text>
                            </View>
                        </View>
                    </TouchableHighlight>
                );
            }
            else {
                return false;
            }
        }
        else if (item.type == 2) {
            let focus = item.is_focus == 1 ? '取消关注' : '添加关注';
            return (
                <TouchableHighlight onPress={() => {
                    this.props.navigation.navigate('User', { id: item.associated_id });
                }}>
                    <View style={{ flexDirection: 'row', backgroundColor: '#fff', padding: 12 }}>
                        <Image style={{ height: 38, width: 38 }} source={{ uri: item.avator }} />
                        <View style={{ flex: 1, paddingHorizontal: 7 }}>
                            <Text style={{ color: '#222', fontSize: 14 }}>{item.nickname}</Text>
                            <Text style={{ color: '#222', fontSize: 12, lineHeight: 22 }}>关注了你</Text>
                            <Text style={{ color: '#ccc', fontSize: 12, lineHeight: 22 }}>{item.created}</Text>
                        </View>
                        <View>
                            <View style={{ borderColor: '#03c893', borderWidth: 1, paddingVertical: 2, paddingHorizontal: 5, justifyContent: 'center' }}>
                                <Text style={{ fontSize: 10, color: '#03c893' }}>{focus}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        }
        else {
            return false;
        }
    }

    _shouldItemUpdate(prev, next) {
        return prev.item !== next.item;
    }

    render() {

        let refreshView = null;
        let nothingView = null;

        if (this.state.isNetDown == true) {
            refreshView = (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => { this._fetchListData() }}>
                        <View style={{ alignItems: 'center' }}>
                            <Icon name="ios-refresh-circle-outline" color="#03c893" size={40} />
                            <Text style={{ fontSize: 12, color: '#03c893' }}>点击刷新</Text>
                        </View>
                    </TouchableHighlight>
                </View>
            );
        }

        if (this.isPageEnd == true && this.state.listData.length == 0) {
            nothingView = (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => { }}>
                        <View style={{ alignItems: 'center' }}>
                            <Icon name="ios-paper-outline" size={40} />
                            <Text style={{ fontSize: 12 }}>暂无消息</Text>
                        </View>
                    </TouchableHighlight>
                </View>
            );
        }

        let body = null;

        if (this.isPageEnd == false && this.state.listData.length == 0 && this.state.isNetDown == false) {
            body = (
                <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator animating={true} size="large" color="#03c893" />
                </View>
            );
        }

        if (this.state.listData.length > 0) {
            body = (
                <View style={{ flex: this.state.listData.length == 0 ? 0 : 1 }}>
                    <AnimatedFlatList
                        data={this.state.listData}
                        debug={false}
                        disableVirtualization={true}
                        legacyImplementation={false}
                        ItemSeparatorComponent={() => { return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: '#ccc' }} /> }}
                        numColumns={1}
                        removeClippedSubviews={false}
                        ListHeaderComponent={() => null}
                        renderItem={this._renderItem.bind(this)}
                        ListFooterComponent={() => {
                            if (this.state.listData.length > 0) {
                                return <LoadMore3 loadMoreFlag={this.state.loadMoreFlag} bgcolor='#fff' />;
                            } else {
                                return null;
                            }
                        }}
                        shouldItemUpdate={this._shouldItemUpdate.bind(this)}
                        onEndReached={() => {
                            if (this.state.loadMoreFlag == 0 && this.isPageEnd == false) {
                                this.setState({ loadMoreFlag: 1 });
                                this._fetchListData();
                            }
                        }}
                    />
                </View>
            );
        }

        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <StatusBar backgroundColor="#03c893" />
                {/* 顶部导航栏 */}
                <View style={{ flexDirection: 'row', height: 45, paddingHorizontal: 12, alignItems: 'center', backgroundColor: '#03c893', justifyContent: 'space-between' }}>
                    <TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => {
                        this.props.navigation.state.params.callback();
                        this.props.navigation.goBack(null);
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="ios-arrow-back-outline" size={22} color="#fff" style={{ marginTop: 1 }} />
                            <Text style={{ color: '#fff', fontSize: 16, marginLeft: 7 }}>消息</Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => { this.props.navigation.navigate('MineHistoryMsg') }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: '#fff', fontSize: 14 }}>历史消息</Text>
                        </View>
                    </TouchableHighlight>
                </View>
                {body}
                {nothingView}
                {refreshView}
            </View>
        );
    }
}