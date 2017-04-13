'use strict';

import React, { Component } from 'react';
import {
    View,
    Text,
    StatusBar,
    ToastAndroid,
    Animated,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    Modal,
    TouchableHighlight,
    AsyncStorage,
    BackAndroid
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import LoadMore from './LoadMore';
import DiscuzPostsRow from './DiscuzPostsRow';
import DiscuzCates from './DiscuzCates';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default class Discuz extends Component {

    constructor(props) {

        super(props);
        this.user = null;
        this.page = 1;
        this.order = 'comment';
        this.isPageEnd = false;
        this.state = { cates: [], dataSource: [], loadMoreFlag: 0, modalVisible: false, refreshing: false, isNetDown: false };
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

    // 获取帖子分类数据
    async _fetchCatesData() {

        let url = 'http://121.11.71.33:8081/api/recommend/list?unique=appluntanfenlei';

        console.log(url);

        try {
            let response = await fetch(url);
            var result = await response.json();
        } catch (error) {
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

    // 获取帖子列表数据
    async _fetchPostsesData() {

        let url = 'http://121.11.71.33:8081/api/posts/list?order=' + this.order + '&page=' + this.page;

        console.log(url);

        try {
            let response = await fetch(url);
            var result = await response.json();
        } catch (error) {
            this.setState({ isNetDown: true });
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
                this.setState({ loadMoreFlag: 2, isNetDown: false });
                return;
            }

            let dataSource = this.state.dataSource;

            dataSource = dataSource.concat(result.list);

            if (result.list.length < 10) {
                this.isPageEnd = true;
                this.setState({ loadMoreFlag: 2, dataSource: dataSource, isNetDown: false });
            }

            if (result.list.length == 10) {
                this.page += 1;
                this.setState({ loadMoreFlag: 0, dataSource: dataSource, isNetDown: false });
            }
        }
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

            ToastAndroid.show('加载完成', ToastAndroid.SHORT);

            let dataSource = [];

            dataSource = dataSource.concat(result.list);

            if (result.list.length < 10) {
                this.isPageEnd = true;
                this.setState({ loadMoreFlag: 2, dataSource: dataSource });
            }

            if (result.list.length == 10) {
                this.page += 1;
                this.setState({ loadMoreFlag: 0, dataSource: dataSource });
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
            this.setState({ refreshing: false, isNetDown: true });
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

            if (result.list.length == 0) {
                this.isPageEnd = true;
                this.setState({ loadMoreFlag: 2, isNetDown: false });
                return;
            }

            let dataSource = [];

            dataSource = dataSource.concat(result.list);

            if (result.list.length < 10) {
                this.isPageEnd = true;
                this.setState({ loadMoreFlag: 2, dataSource: dataSource, refreshing: false, isNetDown: false });
            }

            if (result.list.length == 10) {
                this.setState({ loadMoreFlag: 0, dataSource: dataSource, refreshing: false, isNetDown: false });
            }

            ToastAndroid.show('刷新成功', ToastAndroid.SHORT);
        }
    }

    _ListHeaderComponent() {

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

    _renderItem = ({ item }) => {

        return (<DiscuzPostsRow navigation={this.props.navigation} rowData={item} />);
    }

    _ListFooterComponent() {

        return <LoadMore loadMoreFlag={this.state.loadMoreFlag} bgcolor='#fff' />;
    }

    _shouldItemUpdate(prev, next) {
        return prev.item !== next.item;
    }

    render() {

        let body = (
            <View style={{ flex: 1, backgroundColor: '#f4f4f4', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator animating={true} size="large" color="#03c893" />
            </View>
        );

        if (this.state.isNetDown == true && this.state.cates.length == 0 && this.state.dataSource.length == 0) {
            body = (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => { this._onRefresh() }}>
                        <View style={{ alignItems: 'center' }}>
                            <Icon name="ios-refresh-circle-outline" color="#03c893" size={40} />
                            <Text style={{ fontSize: 12, color: '#03c893' }}>点击刷新</Text>
                        </View>
                    </TouchableHighlight>
                </View>
            );
        }

        if (this.state.cates.length > 0 && this.state.dataSource.length > 0) {
            body = (
                <View style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
                    <AnimatedFlatList
                        refreshing={this.state.refreshing}
                        data={this.state.dataSource}
                        debug={false}
                        disableVirtualization={true}
                        legacyImplementation={false}
                        numColumns={1}
                        removeClippedSubviews={false}
                        ListHeaderComponent={() => this._ListHeaderComponent()}
                        renderItem={this._renderItem.bind(this)}
                        ListFooterComponent={() => this._ListFooterComponent()}
                        onRefresh={this._onRefresh.bind(this)}
                        shouldItemUpdate={this._shouldItemUpdate.bind(this)}
                        onEndReached={() => {
                            if (this.state.loadMoreFlag == 0 && this.isPageEnd == false) {
                                this.setState({ loadMoreFlag: 1 });
                                this._fetchPostsesData();
                            }
                        }}
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