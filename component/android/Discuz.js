'use strict';

import React, { Component } from 'react';
import {
    View,
    Text,
    StatusBar,
    ToastAndroid,
    ListView,
    ActivityIndicator,
    StyleSheet,
    Modal,
    TouchableHighlight,
    AsyncStorage,
    BackAndroid,
    RefreshControl
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import LoadMore from './LoadMore';
import DiscuzPostsRow from './DiscuzPostsRow';
import DiscuzCates from './DiscuzCates';

export default class Discuz extends Component {

    constructor(props) {

        super(props);
        this.user = null;
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.page = 1;
        this.order = 'comment';
        this.isPageEnd = false;
        this.dataSource = [];
        this.state = { cates: [], dataSource: this.ds.cloneWithRows([]), loadMoreFlag: 0, modalVisible: false, refreshing: false };
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

        this._fetchCatesData();
        this._fetchPostsesData();
    }

    componentWillMount() {
        BackAndroid.removeEventListener('hardwareBackPress', this._onBackAndroid);
        BackAndroid.addEventListener('hardwareBackPress', this._onBackAndroid);
    }

    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this._onBackAndroid);
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

    async _fetchCatesData() {

        let url = 'http://121.11.71.33:8081/api/recommend/list?unique=appluntanfenlei';

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
            this.setState({ cates: result.list });
        }
    }


    async _fetchPostsesData() {

        let url = 'http://121.11.71.33:8081/api/posts/list?order=' + this.order + '&page=' + this.page;

        console.log(url);

        try {
            let response = await fetch(url);
            var result = await response.json();
        } catch (error) {
            this.isPageEnd = true;
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == -1) {
            this.isPageEnd = true;
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {

            if (result.list.length == 0) {
                this.isPageEnd = true;
                this.setState({ loadMoreFlag: 2 });
                return;
            }

            for (var i = 0; i < result.list.length; i++) {
                this.dataSource.push(result.list[i]);
            }

            if (result.list.length < 10) {
                this.isPageEnd = true;
                this.setState({ loadMoreFlag: 2, dataSource: this.ds.cloneWithRows(this.dataSource) });
            }

            if (result.list.length == 10) {
                this.page += 1;
                this.setState({ loadMoreFlag: 0, dataSource: this.ds.cloneWithRows(this.dataSource) });
            }
        }
    }

    _renderHeader() {

        return (
            <View>
                <DiscuzCates cates={this.state.cates} navigation={this.props.navigation} />
                {/*排序按钮*/}
                <TouchableHighlight underlayColor="rgba(0,0,0,0.1)" onPress={() => this.setState({ modalVisible: !this.state.modalVisible })}>
                    <View style={{
                        flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 12,
                        borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Text style={{ color: '#53ABFC', marginLeft: 1, fontSize: 12 }}>{this.order == 'new' ? '最新发布' : '最新回复'}</Text>
                        <Icon name="ios-arrow-down-outline" size={12} color="#53ABFC" style={{ marginTop: 2 }} />
                    </View>
                </TouchableHighlight>
                {/*\排序按钮*/}
            </View>
        );
    }

    _renderFooter() {

        return <LoadMore loadMoreFlag={this.state.loadMoreFlag} bgcolor='#fff' />;
    }

    _renderRow(rowData) {

        return (<DiscuzPostsRow navigation={this.props.navigation} rowData={rowData} />);
    }

    async _onPressSort() {

        ToastAndroid.show('正在加载...', ToastAndroid.SHORT);

        let url = 'http://121.11.71.33:8081/api/posts/list?order=' + this.order + '&page=1';

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

            this.page = 1;
            this.isPageEnd = false;

            if (result.list.length == 0) {
                this.isPageEnd = true;
                ToastAndroid.show('没有数据', ToastAndroid.SHORT);
                return;
            }

            this.dataSource = [];

            for (var i = 0; i < result.list.length; i++) {
                this.dataSource.push(result.list[i]);
            }

            if (result.list.length < 10) {
                this.isPageEnd = true;
                this.setState({ loadMoreFlag: 2, dataSource: this.ds.cloneWithRows(this.dataSource) });
            }

            if (result.list.length == 10) {
                this.page += 1;
                this.setState({ loadMoreFlag: 0, dataSource: this.ds.cloneWithRows(this.dataSource) });
            }
        }
    }

    async _onRefresh() {

        this.setState({ refreshing: true });

        this._fetchCatesData();

        let url = 'http://121.11.71.33:8081/api/posts/list?order=comment&page=1';

        console.log(url);

        try {
            let response = await fetch(url);
            var result = await response.json();
        } catch (error) {
            this.isPageEnd = true;
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == -1) {
            this.isPageEnd = true;
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {

            this.order = 'comment';
            this.page = 2;
            this.isPageEnd = false;
            this.dataSource = [];

            if (result.list.length == 0) {
                this.isPageEnd = true;
                this.setState({ loadMoreFlag: 2 });
                return;
            }

            for (var i = 0; i < result.list.length; i++) {
                this.dataSource.push(result.list[i]);
            }

            if (result.list.length < 10) {
                this.isPageEnd = true;
                this.setState({ loadMoreFlag: 2, dataSource: this.ds.cloneWithRows(this.dataSource), refreshing: false });
            }

            if (result.list.length == 10) {
                this.setState({ loadMoreFlag: 0, dataSource: this.ds.cloneWithRows(this.dataSource), refreshing: false });
            }

            ToastAndroid.show('刷新成功', ToastAndroid.SHORT);
        }
    }

    render() {

        let body = (
            <View style={{ flex: 1, backgroundColor: '#f4f4f4', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator animating={true} size="large" color="#03c893" />
            </View>
        );

        if (this.dataSource.length > 0 && this.state.cates.length > 0) {
            body = (
                <View style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
                    <ListView
                        refreshControl={
                            <RefreshControl enabled={true} refreshing={this.state.refreshing} onRefresh={() => this._onRefresh()}
                                progressBackgroundColor='#eee' colors={['#ffaa66cc', '#ff00ddff']} />
                        }
                        showsVerticalScrollIndicator={true}
                        showsHorizontalScrollIndicator={false}
                        enableEmptySections={true}
                        renderFooter={() => this._renderFooter()}
                        renderHeader={() => this._renderHeader()}
                        dataSource={this.state.dataSource}
                        onEndReached={() => {
                            if (this.state.loadMoreFlag == 0 && this.isPageEnd == false) {
                                this.setState({ loadMoreFlag: 1 });
                                this._fetchPostsesData();
                            }
                        }}
                        renderRow={this._renderRow.bind(this)}
                    />
                </View>
            );
        }

        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    {/* 状态栏 */}
                    <StatusBar backgroundColor="#03c893" barStyle="light-content" />
                    {/* 工具栏 */}
                    <View style={{ flexDirection: 'row', height: 45, paddingHorizontal: 12, alignItems: 'center', backgroundColor: '#03c893', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 16, color: '#fff' }}>河源社区</Text>
                        <TouchableHighlight underlayColor='rgba(0,0,0,0)' onPress={() => {
                            if (this.user == null) {
                                this.props.navigation.navigate('Login');
                                return;
                            }
                            this.props.navigation.navigate('PostsPublish');
                        }}>
                            <Icon name="ios-create-outline" size={28} color="#fff" />
                        </TouchableHighlight>
                    </View>
                    {/* 主体内容 */}
                    {body}
                </View>
                {/* 底部导航栏 */}
                {/*<BottomNav name="Discuz" nav={this.props.navigation} />*/}
                {/*排序选择模态框*/}
                <Modal transparent={true} visible={this.state.modalVisible} onRequestClose={() => this.setState({ modalVisible: false })}>
                    <StatusBar backgroundColor="#000" />
                    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                        <View style={{ backgroundColor: '#fff' }}>
                            <TouchableHighlight
                                underlayColor="rgba(0,0,0,0.1)"
                                style={{ paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc', alignItems: 'center' }}
                                onPress={() => { this.setState({ modalVisible: !this.state.modalVisible }); this.order = 'comment'; this._onPressSort() }}
                            >
                                <Text>最新回复</Text>
                            </TouchableHighlight>
                            <TouchableHighlight
                                underlayColor="rgba(0,0,0,0.1)"
                                style={{ paddingVertical: 14, alignItems: 'center' }}
                                onPress={() => { this.setState({ modalVisible: !this.state.modalVisible }); this.order = 'new'; this._onPressSort() }}
                            >
                                <Text>最新发布</Text>
                            </TouchableHighlight>
                            <View style={{ height: 15, backgroundColor: '#f4f4f4' }} />
                            <TouchableHighlight
                                underlayColor="rgba(0,0,0,0.1)"
                                style={{ paddingVertical: 14, alignItems: 'center' }}
                                onPress={() => this.setState({ modalVisible: !this.state.modalVisible })}
                            >
                                <Text>取消排序</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </Modal>
                {/*\排序选择模态框*/}
            </View>
        );
    }
}