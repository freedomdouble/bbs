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
    ListView,
    RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import IndexPostsRow from './IndexPostsRow';
import LoadMore2 from './LoadMore2';

export default class MinePosts extends Component {

    constructor(props) {

        super(props);
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.page = 1;
        this.isPageEnd = false;
        this.list = [];
        this.user = null;
        this.state = {
            refreshing: true,
            dataSource: this.ds.cloneWithRows([]),
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

            for (var i = 0; i < dataLength; i++) {
                this.list.push(result.list[i]);
            }

            this.page += 1;

            this.setState({ refreshing: false, dataSource: this.ds.cloneWithRows(this.list), loadMoreFlag: loadMoreFlag });
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

            this.list = this.list.concat(result.list);
            this.setState({ refreshing: false, dataSource: this.ds.cloneWithRows(this.list), loadMoreFlag: loadMoreFlag });
            ToastAndroid.show('刷新成功', ToastAndroid.SHORT);
        }
        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.setState({ refreshing: false });
        }
    }

    _renderRow(rowData) {
        return <IndexPostsRow navigation={this.props.navigation} rowData={rowData} />;
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
                    <ListView
                        refreshControl={
                            <RefreshControl enabled={true} refreshing={this.state.refreshing} onRefresh={() => this._onRefresh()} progressBackgroundColor='#eee' colors={['#ffaa66cc', '#ff00ddff']} />
                        }
                        showsVerticalScrollIndicator={true}
                        showsHorizontalScrollIndicator={false}
                        enableEmptySections={true}
                        renderFooter={() => <LoadMore2 loadMoreFlag={this.state.loadMoreFlag} />}
                        dataSource={this.state.dataSource}
                        onEndReached={() => {
                            if (this.state.refreshing == false && this.state.loadMoreFlag == 0 && this.isPageEnd == false) {
                                this.setState({ loadMoreFlag: 1 });
                                this._fetchData();
                            }
                        }}
                        renderRow={this._renderRow.bind(this)}
                    />
                </View>
            </View>
        );
    }
}