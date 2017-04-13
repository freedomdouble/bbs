'use strict'

import React, { Component } from 'react';
import {
    View,
    Text,
    StatusBar,
    AsyncStorage,
    TouchableHighlight,
    ToastAndroid,
    BackAndroid,
    Animated,
    FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import IndexPostsRow from './IndexPostsRow';
import LoadMore2 from './LoadMore2';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default class MinePosts extends Component {

    constructor(props) {

        super(props);
        this.page = 1;
        this.isPageEnd = false;
        this.user = null;
        this.state = {
            refreshing: true,
            listData: [],
            loadMoreFlag: 0,
        };
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

        this._fetchData();
    }

    // 获取数据
    async _fetchData() {

        let url = 'http://121.11.71.33:8081/api/posts/mine?page=' + this.page;

        console.log(url);

        try {
            let response = await fetch(url, { headers: { 'Authorization': this.user == null ? null : this.user.token } });
            var result = await response.json();
        } catch (error) {
            this.setState({ refreshing: false });
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {
            let dataLength = result.list.length;
            let loadMoreFlag = 0;

            if (dataLength < 15) {
                loadMoreFlag = 2;
                this.isPageEnd = true;
            }

            let listData = this.state.listData;
            listData = listData.concat(result.list);

            this.page += 1;

            this.setState({ refreshing: false, listData: listData, loadMoreFlag: loadMoreFlag });
        }
        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.setState({ refreshing: false });
        }
    }

    // 下拉获取数据
    async _onRefresh() {

        this.setState({ refreshing: true });

        let url = 'http://121.11.71.33:8081/api/posts/mine?page=1';

        console.log(url);

        try {
            let response = await fetch(url, { headers: { 'Authorization': this.user == null ? null : this.user.token } });
            var result = await response.json();
        } catch (error) {
            this.setState({ refreshing: false });
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {

            this.isPageEnd = false;
            this.page = 2;
            this.list = [];

            let dataLength = result.list.length;
            let loadMoreFlag = 0;

            if (dataLength < 15) {
                loadMoreFlag = 2;
                this.isPageEnd = true;
            }

            this.setState({ refreshing: false, listData: result.list, loadMoreFlag: loadMoreFlag });
            ToastAndroid.show('刷新成功', ToastAndroid.SHORT);
        }
        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.setState({ refreshing: false });
        }
    }

    _renderItem = ({ item }) => {
        return <IndexPostsRow navigation={this.props.navigation} rowData={item} />;
    }

    _shouldItemUpdate(prev, next) {
        return prev.item !== next.item;
    }

    render() {

        return (
            <View style={{ flex: 1 }}>
                <StatusBar backgroundColor="#03c893" />
                {/* 顶部导航栏 */}
                <View style={{ flexDirection: 'row', height: 45, paddingHorizontal: 12, alignItems: 'center', backgroundColor: '#03c893', }}>
                    <TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => { this.props.navigation.goBack(null); }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="ios-arrow-back-outline" size={22} color="#fff" style={{ marginTop: 1 }} />
                            <Text style={{ color: '#fff', fontSize: 16, marginLeft: 7 }}>我的帖子</Text>
                        </View>
                    </TouchableHighlight>
                </View>
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    <AnimatedFlatList
                        refreshing={this.state.refreshing}
                        data={this.state.listData}
                        debug={false}
                        disableVirtualization={true}
                        legacyImplementation={false}
                        numColumns={1}
                        removeClippedSubviews={false}
                        renderItem={this._renderItem.bind(this)}
                        ListFooterComponent={() => <LoadMore2 loadMoreFlag={this.state.loadMoreFlag} />}
                        onRefresh={this._onRefresh.bind(this)}
                        shouldItemUpdate={this._shouldItemUpdate.bind(this)}
                        onEndReached={() => {
                            if (this.state.refreshing == false && this.state.loadMoreFlag == 0 && this.isPageEnd == false) {
                                this.setState({ loadMoreFlag: 1 });
                                this._fetchData();
                            }
                        }}
                    />
                </View>
            </View>
        );
    }
}