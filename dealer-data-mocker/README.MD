# 背景
日常开发中，经常需要mock数据，目前有很多工具提供数据mock功能，如mockjs等。  
在实际调研中发现，依赖框架mock数据的场景很少，大部分场景都是利用mock工具，返回固定的数据。  
究其原因，还是因为mock出的数据可用性很差，如某接口，希望返回的数据是这样的：

``` json
{
  "returncode": 0,
  "message": "success",
  "result": {
    "cityId": 610500,
    "cityName": "渭南",
    "provinceId": 610000,
    "provinceName": "陕西",
    "dealerList": [
      {
        "dealerId": 14084,
        "dealerName": "渭南宏远恒泰汽车销售服务有限公司",
        "dealerAddress": "渭南市华山大街东段丰原路口东100米路南",
        "dealerSimpleName": "宏远恒泰汽车"
      },
      {
        "dealerId": 2068553,
        "dealerName": "渭南源鑫贸易有限责任公司",
        "dealerAddress": "渭南高新区东风街西段",
        "dealerSimpleName": "渭南源鑫众泰4S店"
      }
    ],
    "dealerCount": 2
  }
}
```
但实际结果可能是这样的：
``` json
{
  "returncode": 0,
  "message": "success",
  "result": {
    "cityId": 69082984,
    "cityName": "sit dolor quis proident do",
    "provinceId": 90528198,
    "provinceName": "in eu",
    "dealerList": [
      {
        "dealerId": 83892611,
        "dealerName": "minim do enim",
        "dealerAddress": "amet sint",
        "dealerSimpleName": "eu tempor consequat"
      },
      {
        "dealerId": 19295239,
        "dealerName": "Duis tempor quis",
        "dealerAddress": "proident dolore enim",
        "dealerSimpleName": "deserunt non do sint do"
      }
    ],
    "dealerCount": -97513975
  }
}
```
上述接口中，我们希望可以mock出城市信息，并且城市Id和城市名称、级别是正确对应的，并且dealerList的数据确实为该城市下经销商。其实我们可以写一个类似如下的模板：
```javascript
{
    @city,
    dealerList: @array(@dealer[cityId == $city.cityId]),
    dealerCount: $this.dealerList.length
}
```
为了解决基础数据mock及属性关联的问题，我们设计了一个基础数据mock工具。

# 基本原理
本框架的基本原理是 
1. 预置基础数据
2. 编译模板
3. 解析值、条件、参数
4. 分析属性依赖关系
5. 确定渲染先后顺序
6. 渲染模板并返回结果


# 语法说明
javascript 语法，不同与 json （json属性名需要双引号，js则不用）：  
为了便于描述，我们将内置的能mock出不同类型数据的对象（如：@dealer，@city，@int等）称之为：mocker。  
1. mocker 名称都是 “@+名称”，如 @dealer  
2. 引用 名称都是 “$+名称”，如 $this，$query 等
```javascript
{
    @city[cityId == $query.cityId],
    dealerList: @array(@dealer[cityId == $city.cityId], size=2-3),
    dealerCount: $this.dealerList.length,
    other: {
        property1: @int(1000-9999),
        property2: $.property1
    }
}
```
如果是没有属性名的mocker（上述代码中的@city），则会将结果铺开，如：
并且可以在其他属性中引用（$开头）该mocker生成的值，(只有无名称的mocker才可以)
```javascript
{
    @dealer,
    alias: $dealer.dealerId
}
/**
 * 会展开成：
 * 
 * {
 *      dealerName: "",
 *      dealerId: 1111,
 *      .....
 *      other: 1111 
 * }
 * 
 * /

```

## 基本语法
基本格式为 “属性名: 属性值”，这里具体说一下“属性值”。属性值支持：数字，字符串，mocker，对象（对象内部可以嵌套上输值类型），表达式，共五种。

### 1. 数字
```javascript
{
    age: 100
}
```
### 2. 字符串
```javascript
{
    name: "join"
}
```

### 3. mocker
中括号（[]）中为条件，小括号（()）中为参数，第一个参数为默认参数（default），后面的参数可以选填，如：
```javascript
{
    @dealer[city == 110100](/*param*/)
    list: @array('str to repeat', size = 10)
}
```

### 4. 对象
```javascript
{
    complex: {
        p1: 123,
        p2: @array('str to repeat', size = 10)
    }
}
```
### 5. 表达式
```javascript
{
    express: 1 + 2 + 4
}
```
## 对象引用
为了描述不同数据之间的关联关系，我们定义了一些引用，可以设置一些属性之间的关系，内置的引用包括： 
1. $query：url参数，因为query都是string类型，所以要注意类型问题  
如http://xxx.com?cityId=110100，则 @city\[city  ===  $query.cityId\] 则会一直是false，因为city的cityId属性是数字，而$query.cityId是字符串，可以改成 @city\[city  ==  $query.cityId\]
2. $this 根级别引用  
3. $.  （美元符号+半角的点），表示同一级别的对象引用。
4. $+name，如$city，$dealer等，无名称根级别mocker引用
具体示例如下：
```javascript
{
    cityId: $query.cityId, //使用query中的cityId值
    @city[cityId == $this.cityId, cityLevel === 2], //使用对象根级别的cityId属性
    complex: {
        rootCityName: $city.cityName, // $city 为无名称的mocker（@city）的引用 
        p1: 1,
        p2: $.p1, //同级别对象的p1属性
        p3: $this.cityId //内部也可以用到$this的引用
    }
}
```

若url中cityId参数为130100，则最终结果如下：
```json
{
    "cityId": 130100,
    "cityName": "石家庄",
    "provinceId": 130000,
    "provinceName": "河北",
    "firstLetter": "S",
    "cityLevel": 2,
    "complex": {
        "rootCityName": "石家庄",
        "p1": 1,
        "p3": 130100,
        "p2": 1
    }
}
``` 

# 内置mocker(丰富中)

## 基本类
### 1. @array(@series, size=10-15)  
返回一个数组  
默认参数为需要重复的对象，可以是基本类型（@array('repeat')），也可以是mocker类型（@array(@dealer)），也可以是对象（@array({username: 'zhansan', @dealer})）  
#### 其他参数说明：
| 参数 | 含义 | 实例 |
| ---- | ---- | ---- |
| size | 数组大小 | size = 10 或 size = 3-10(3到10之间的随机到小) |

### 2. @int(3-10)  
随机一个整数  
默认参数格式为： 10 或 10-100 （固定数字或数字范围）
#### 其他参数说明：
| 参数 | 含义 | 实例 |
| ---- | ---- | ---- |

### 3. @random([1, 3, '张三'])  
随机返回参数数组中的一个元素  
默认参数为数据，数据元素可以为数字或者字符串

#### 其他参数说明：
| 参数 | 含义 | 实例 |
| ---- | ---- | ---- |


## 基础数据类

### 1. @dealer （经销商基本信息）
#### 属性列表
| 名称 | 含义 | 类型 |
| ---- | ---- | ---- |
| dealerId| 经销商店铺Id | int |
| dealerInfoId| 经销商实体Id | int |
| dealerName| 经销商名称 | string |
| dealerSimpleName| 经销商简称 | string |
| dealerAddress| 经销商地址 | string |
| cityId| 所属城市Id | int |
| sellphone| 销售电话 | string |
| linkMan| 联系人 | string |
| mainBrandImage| 主营品牌图片 | string |
| dealerImage| 头图 | string |
| longitude| 地址坐标经度 | float |
| latitude| 地址坐标维度 | float |

### 2. @series （车系信息）
#### 属性列表
| 名称 | 含义 | 类型 |
| ---- | ---- | ---- |
| seriesId | 车系Id | int |
| seriesName | 车系名称 | string |
| maxOriginalPrice | 最高指导价 | int |
| minOriginalPrice | 最低指导价 | int |
| seriesStatus | 售卖状态 | int |
| factoryId | 厂商Id | int |
| factoryName | 厂商名称 | string |
| brandId | 品牌Id | int |
| brandName | 品牌名称 | string |
| isNewEnergy | 是否新能源 | int |
| seriesImage | 车系白底图 | string |
| seriesLogo":  | 车系透明图 | string |

### 3. @city （车系信息）
#### 属性列表
| 名称 | 含义 | 类型 |
| ---- | ---- | ---- |
| cityId | 城市Id | int |
| cityName | 城市名称 | string |
| provinceId | 省份Id | int |
| provinceName | 省份名称 | string |
| firstLetter | 首字母 | string |
| cityLevel | 城市级别 | int |

# 集成YAPI

## 介绍
为了方便使用该工具，我们将其集成到了yapi中。该插件会在yapi生成完mock数据后，对数据中相同的属性进行值替换。


## 使用说明
![界面截图](https://dealer2.autoimg.cn/dealerdfs/g24/M01/92/68/autohomedealer__Chtk3WCjU0GABLSPAACkVbMxDQA696.png)

该工具集成yapi接口的 “高级mock” tab中的 “高级模板” 中。
1. 是否启用该功能呢。
2. json path：接口mock数据的json path，如下面的json为例，若只需要替换“result.complex”中属性，则此处填 result.complex 即可，若为空，则此处为空即可。
```json
{
    "returncode": 0,
    "message": "success",
    "result": {
        "complex": {
             //.....
        }
    }
}
```
3. 模板编辑区


# 有问题找 xiehaifeng@autohome.com.cn