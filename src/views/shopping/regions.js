// 精简版省市区数据（仅含省级+主要城市+城区，用于 C 端收件地址联动选择）
// 结构：{ value, label, children }，兼容 el-cascader
export const regionOptions = [
  {
    value: '北京市',
    label: '北京市',
    children: [
      {
        value: '北京市',
        label: '北京市',
        children: [
          { value: '东城区', label: '东城区' },
          { value: '西城区', label: '西城区' },
          { value: '朝阳区', label: '朝阳区' },
          { value: '丰台区', label: '丰台区' },
          { value: '石景山区', label: '石景山区' },
          { value: '海淀区', label: '海淀区' },
          { value: '门头沟区', label: '门头沟区' },
          { value: '房山区', label: '房山区' },
          { value: '通州区', label: '通州区' },
          { value: '顺义区', label: '顺义区' },
          { value: '昌平区', label: '昌平区' },
          { value: '大兴区', label: '大兴区' },
          { value: '怀柔区', label: '怀柔区' },
          { value: '平谷区', label: '平谷区' }
        ]
      }
    ]
  },
  {
    value: '天津市',
    label: '天津市',
    children: [
      {
        value: '天津市',
        label: '天津市',
        children: [
          { value: '和平区', label: '和平区' },
          { value: '河东区', label: '河东区' },
          { value: '河西区', label: '河西区' },
          { value: '南开区', label: '南开区' },
          { value: '河北区', label: '河北区' },
          { value: '红桥区', label: '红桥区' },
          { value: '滨海新区', label: '滨海新区' },
          { value: '武清区', label: '武清区' }
        ]
      }
    ]
  },
  {
    value: '河北省',
    label: '河北省',
    children: [
      {
        value: '石家庄市',
        label: '石家庄市',
        children: [
          { value: '长安区', label: '长安区' },
          { value: '桥西区', label: '桥西区' },
          { value: '新华区', label: '新华区' },
          { value: '裕华区', label: '裕华区' },
          { value: '藁城区', label: '藁城区' }
        ]
      },
      {
        value: '唐山市',
        label: '唐山市',
        children: [
          { value: '路南区', label: '路南区' },
          { value: '路北区', label: '路北区' },
          { value: '丰南区', label: '丰南区' },
          { value: '曹妃甸区', label: '曹妃甸区' }
        ]
      },
      {
        value: '保定市',
        label: '保定市',
        children: [
          { value: '竞秀区', label: '竞秀区' },
          { value: '莲池区', label: '莲池区' },
          { value: '满城区', label: '满城区' }
        ]
      }
    ]
  },
  {
    value: '山西省',
    label: '山西省',
    children: [
      {
        value: '太原市',
        label: '太原市',
        children: [
          { value: '小店区', label: '小店区' },
          { value: '迎泽区', label: '迎泽区' },
          { value: '杏花岭区', label: '杏花岭区' },
          { value: '万柏林区', label: '万柏林区' },
          { value: '晋源区', label: '晋源区' }
        ]
      },
      {
        value: '大同市',
        label: '大同市',
        children: [
          { value: '平城区', label: '平城区' },
          { value: '云冈区', label: '云冈区' },
          { value: '新荣区', label: '新荣区' }
        ]
      }
    ]
  },
  {
    value: '内蒙古自治区',
    label: '内蒙古自治区',
    children: [
      {
        value: '呼和浩特市',
        label: '呼和浩特市',
        children: [
          { value: '新城区', label: '新城区' },
          { value: '回民区', label: '回民区' },
          { value: '玉泉区', label: '玉泉区' },
          { value: '赛罕区', label: '赛罕区' }
        ]
      },
      {
        value: '包头市',
        label: '包头市',
        children: [
          { value: '东河区', label: '东河区' },
          { value: '昆都仑区', label: '昆都仑区' },
          { value: '青山区', label: '青山区' }
        ]
      }
    ]
  },
  {
    value: '辽宁省',
    label: '辽宁省',
    children: [
      {
        value: '沈阳市',
        label: '沈阳市',
        children: [
          { value: '和平区', label: '和平区' },
          { value: '沈河区', label: '沈河区' },
          { value: '大东区', label: '大东区' },
          { value: '皇姑区', label: '皇姑区' },
          { value: '铁西区', label: '铁西区' }
        ]
      },
      {
        value: '大连市',
        label: '大连市',
        children: [
          { value: '中山区', label: '中山区' },
          { value: '西岗区', label: '西岗区' },
          { value: '沙河口区', label: '沙河口区' },
          { value: '甘井子区', label: '甘井子区' }
        ]
      }
    ]
  },
  {
    value: '吉林省',
    label: '吉林省',
    children: [
      {
        value: '长春市',
        label: '长春市',
        children: [
          { value: '南关区', label: '南关区' },
          { value: '宽城区', label: '宽城区' },
          { value: '朝阳区', label: '朝阳区' },
          { value: '二道区', label: '二道区' },
          { value: '绿园区', label: '绿园区' }
        ]
      },
      {
        value: '吉林市',
        label: '吉林市',
        children: [
          { value: '昌邑区', label: '昌邑区' },
          { value: '龙潭区', label: '龙潭区' },
          { value: '船营区', label: '船营区' }
        ]
      }
    ]
  },
  {
    value: '黑龙江省',
    label: '黑龙江省',
    children: [
      {
        value: '哈尔滨市',
        label: '哈尔滨市',
        children: [
          { value: '道里区', label: '道里区' },
          { value: '南岗区', label: '南岗区' },
          { value: '道外区', label: '道外区' },
          { value: '香坊区', label: '香坊区' },
          { value: '松北区', label: '松北区' }
        ]
      },
      {
        value: '大庆市',
        label: '大庆市',
        children: [
          { value: '萨尔图区', label: '萨尔图区' },
          { value: '龙凤区', label: '龙凤区' },
          { value: '让胡路区', label: '让胡路区' }
        ]
      }
    ]
  },
  {
    value: '上海市',
    label: '上海市',
    children: [
      {
        value: '上海市',
        label: '上海市',
        children: [
          { value: '黄浦区', label: '黄浦区' },
          { value: '徐汇区', label: '徐汇区' },
          { value: '长宁区', label: '长宁区' },
          { value: '静安区', label: '静安区' },
          { value: '普陀区', label: '普陀区' },
          { value: '虹口区', label: '虹口区' },
          { value: '杨浦区', label: '杨浦区' },
          { value: '浦东新区', label: '浦东新区' },
          { value: '闵行区', label: '闵行区' },
          { value: '宝山区', label: '宝山区' },
          { value: '嘉定区', label: '嘉定区' },
          { value: '松江区', label: '松江区' }
        ]
      }
    ]
  },
  {
    value: '江苏省',
    label: '江苏省',
    children: [
      {
        value: '南京市',
        label: '南京市',
        children: [
          { value: '玄武区', label: '玄武区' },
          { value: '秦淮区', label: '秦淮区' },
          { value: '建邺区', label: '建邺区' },
          { value: '鼓楼区', label: '鼓楼区' },
          { value: '江宁区', label: '江宁区' }
        ]
      },
      {
        value: '苏州市',
        label: '苏州市',
        children: [
          { value: '姑苏区', label: '姑苏区' },
          { value: '虎丘区', label: '虎丘区' },
          { value: '吴中区', label: '吴中区' },
          { value: '相城区', label: '相城区' },
          { value: '工业园区', label: '工业园区' }
        ]
      },
      {
        value: '无锡市',
        label: '无锡市',
        children: [
          { value: '锡山区', label: '锡山区' },
          { value: '惠山区', label: '惠山区' },
          { value: '滨湖区', label: '滨湖区' },
          { value: '梁溪区', label: '梁溪区' }
        ]
      }
    ]
  },
  {
    value: '浙江省',
    label: '浙江省',
    children: [
      {
        value: '杭州市',
        label: '杭州市',
        children: [
          { value: '上城区', label: '上城区' },
          { value: '拱墅区', label: '拱墅区' },
          { value: '西湖区', label: '西湖区' },
          { value: '滨江区', label: '滨江区' },
          { value: '余杭区', label: '余杭区' }
        ]
      },
      {
        value: '宁波市',
        label: '宁波市',
        children: [
          { value: '海曙区', label: '海曙区' },
          { value: '江北区', label: '江北区' },
          { value: '北仑区', label: '北仑区' },
          { value: '鄞州区', label: '鄞州区' }
        ]
      },
      {
        value: '温州市',
        label: '温州市',
        children: [
          { value: '鹿城区', label: '鹿城区' },
          { value: '龙湾区', label: '龙湾区' },
          { value: '瓯海区', label: '瓯海区' }
        ]
      }
    ]
  },
  {
    value: '安徽省',
    label: '安徽省',
    children: [
      {
        value: '合肥市',
        label: '合肥市',
        children: [
          { value: '瑶海区', label: '瑶海区' },
          { value: '庐阳区', label: '庐阳区' },
          { value: '蜀山区', label: '蜀山区' },
          { value: '包河区', label: '包河区' }
        ]
      },
      {
        value: '芜湖市',
        label: '芜湖市',
        children: [
          { value: '镜湖区', label: '镜湖区' },
          { value: '弋江区', label: '弋江区' },
          { value: '鸠江区', label: '鸠江区' }
        ]
      }
    ]
  },
  {
    value: '福建省',
    label: '福建省',
    children: [
      {
        value: '福州市',
        label: '福州市',
        children: [
          { value: '鼓楼区', label: '鼓楼区' },
          { value: '台江区', label: '台江区' },
          { value: '仓山区', label: '仓山区' },
          { value: '晋安区', label: '晋安区' }
        ]
      },
      {
        value: '厦门市',
        label: '厦门市',
        children: [
          { value: '思明区', label: '思明区' },
          { value: '海沧区', label: '海沧区' },
          { value: '湖里区', label: '湖里区' },
          { value: '集美区', label: '集美区' },
          { value: '翔安区', label: '翔安区' }
        ]
      }
    ]
  },
  {
    value: '江西省',
    label: '江西省',
    children: [
      {
        value: '南昌市',
        label: '南昌市',
        children: [
          { value: '东湖区', label: '东湖区' },
          { value: '西湖区', label: '西湖区' },
          { value: '青云谱区', label: '青云谱区' },
          { value: '青山湖区', label: '青山湖区' }
        ]
      },
      {
        value: '赣州市',
        label: '赣州市',
        children: [
          { value: '章贡区', label: '章贡区' },
          { value: '南康区', label: '南康区' },
          { value: '赣县区', label: '赣县区' }
        ]
      }
    ]
  },
  {
    value: '山东省',
    label: '山东省',
    children: [
      {
        value: '济南市',
        label: '济南市',
        children: [
          { value: '历下区', label: '历下区' },
          { value: '市中区', label: '市中区' },
          { value: '槐荫区', label: '槐荫区' },
          { value: '天桥区', label: '天桥区' },
          { value: '历城区', label: '历城区' }
        ]
      },
      {
        value: '青岛市',
        label: '青岛市',
        children: [
          { value: '市南区', label: '市南区' },
          { value: '市北区', label: '市北区' },
          { value: '黄岛区', label: '黄岛区' },
          { value: '崂山区', label: '崂山区' },
          { value: '城阳区', label: '城阳区' }
        ]
      },
      {
        value: '烟台市',
        label: '烟台市',
        children: [
          { value: '芝罘区', label: '芝罘区' },
          { value: '福山区', label: '福山区' },
          { value: '牟平区', label: '牟平区' }
        ]
      }
    ]
  },
  {
    value: '河南省',
    label: '河南省',
    children: [
      {
        value: '郑州市',
        label: '郑州市',
        children: [
          { value: '中原区', label: '中原区' },
          { value: '二七区', label: '二七区' },
          { value: '金水区', label: '金水区' },
          { value: '管城回族区', label: '管城回族区' },
          { value: '惠济区', label: '惠济区' }
        ]
      },
      {
        value: '洛阳市',
        label: '洛阳市',
        children: [
          { value: '老城区', label: '老城区' },
          { value: '西工区', label: '西工区' },
          { value: '涧西区', label: '涧西区' },
          { value: '洛龙区', label: '洛龙区' }
        ]
      }
    ]
  },
  {
    value: '湖北省',
    label: '湖北省',
    children: [
      {
        value: '武汉市',
        label: '武汉市',
        children: [
          { value: '江岸区', label: '江岸区' },
          { value: '江汉区', label: '江汉区' },
          { value: '硚口区', label: '硚口区' },
          { value: '汉阳区', label: '汉阳区' },
          { value: '武昌区', label: '武昌区' },
          { value: '洪山区', label: '洪山区' }
        ]
      },
      {
        value: '宜昌市',
        label: '宜昌市',
        children: [
          { value: '西陵区', label: '西陵区' },
          { value: '伍家岗区', label: '伍家岗区' },
          { value: '点军区', label: '点军区' }
        ]
      }
    ]
  },
  {
    value: '湖南省',
    label: '湖南省',
    children: [
      {
        value: '长沙市',
        label: '长沙市',
        children: [
          { value: '芙蓉区', label: '芙蓉区' },
          { value: '天心区', label: '天心区' },
          { value: '岳麓区', label: '岳麓区' },
          { value: '开福区', label: '开福区' },
          { value: '雨花区', label: '雨花区' }
        ]
      },
      {
        value: '株洲市',
        label: '株洲市',
        children: [
          { value: '荷塘区', label: '荷塘区' },
          { value: '芦淞区', label: '芦淞区' },
          { value: '天元区', label: '天元区' }
        ]
      }
    ]
  },
  {
    value: '广东省',
    label: '广东省',
    children: [
      {
        value: '广州市',
        label: '广州市',
        children: [
          { value: '荔湾区', label: '荔湾区' },
          { value: '越秀区', label: '越秀区' },
          { value: '海珠区', label: '海珠区' },
          { value: '天河区', label: '天河区' },
          { value: '白云区', label: '白云区' },
          { value: '黄埔区', label: '黄埔区' },
          { value: '番禺区', label: '番禺区' }
        ]
      },
      {
        value: '深圳市',
        label: '深圳市',
        children: [
          { value: '罗湖区', label: '罗湖区' },
          { value: '福田区', label: '福田区' },
          { value: '南山区', label: '南山区' },
          { value: '宝安区', label: '宝安区' },
          { value: '龙岗区', label: '龙岗区' },
          { value: '龙华区', label: '龙华区' }
        ]
      },
      {
        value: '珠海市',
        label: '珠海市',
        children: [
          { value: '香洲区', label: '香洲区' },
          { value: '斗门区', label: '斗门区' },
          { value: '金湾区', label: '金湾区' }
        ]
      },
      {
        value: '东莞市',
        label: '东莞市',
        children: [
          { value: '莞城街道', label: '莞城街道' },
          { value: '南城街道', label: '南城街道' },
          { value: '东城街道', label: '东城街道' }
        ]
      }
    ]
  },
  {
    value: '广西壮族自治区',
    label: '广西壮族自治区',
    children: [
      {
        value: '南宁市',
        label: '南宁市',
        children: [
          { value: '兴宁区', label: '兴宁区' },
          { value: '青秀区', label: '青秀区' },
          { value: '江南区', label: '江南区' },
          { value: '西乡塘区', label: '西乡塘区' },
          { value: '良庆区', label: '良庆区' }
        ]
      },
      {
        value: '桂林市',
        label: '桂林市',
        children: [
          { value: '秀峰区', label: '秀峰区' },
          { value: '叠彩区', label: '叠彩区' },
          { value: '象山区', label: '象山区' },
          { value: '七星区', label: '七星区' }
        ]
      }
    ]
  },
  {
    value: '海南省',
    label: '海南省',
    children: [
      {
        value: '海口市',
        label: '海口市',
        children: [
          { value: '秀英区', label: '秀英区' },
          { value: '龙华区', label: '龙华区' },
          { value: '琼山区', label: '琼山区' },
          { value: '美兰区', label: '美兰区' }
        ]
      },
      {
        value: '三亚市',
        label: '三亚市',
        children: [
          { value: '海棠区', label: '海棠区' },
          { value: '吉阳区', label: '吉阳区' },
          { value: '天涯区', label: '天涯区' }
        ]
      }
    ]
  },
  {
    value: '重庆市',
    label: '重庆市',
    children: [
      {
        value: '重庆市',
        label: '重庆市',
        children: [
          { value: '渝中区', label: '渝中区' },
          { value: '大渡口区', label: '大渡口区' },
          { value: '江北区', label: '江北区' },
          { value: '沙坪坝区', label: '沙坪坝区' },
          { value: '九龙坡区', label: '九龙坡区' },
          { value: '南岸区', label: '南岸区' },
          { value: '渝北区', label: '渝北区' },
          { value: '巴南区', label: '巴南区' }
        ]
      }
    ]
  },
  {
    value: '四川省',
    label: '四川省',
    children: [
      {
        value: '成都市',
        label: '成都市',
        children: [
          { value: '锦江区', label: '锦江区' },
          { value: '青羊区', label: '青羊区' },
          { value: '金牛区', label: '金牛区' },
          { value: '武侯区', label: '武侯区' },
          { value: '成华区', label: '成华区' },
          { value: '龙泉驿区', label: '龙泉驿区' },
          { value: '高新区', label: '高新区' }
        ]
      },
      {
        value: '绵阳市',
        label: '绵阳市',
        children: [
          { value: '涪城区', label: '涪城区' },
          { value: '游仙区', label: '游仙区' },
          { value: '安州区', label: '安州区' }
        ]
      }
    ]
  },
  {
    value: '贵州省',
    label: '贵州省',
    children: [
      {
        value: '贵阳市',
        label: '贵阳市',
        children: [
          { value: '南明区', label: '南明区' },
          { value: '云岩区', label: '云岩区' },
          { value: '花溪区', label: '花溪区' },
          { value: '乌当区', label: '乌当区' },
          { value: '观山湖区', label: '观山湖区' }
        ]
      },
      {
        value: '遵义市',
        label: '遵义市',
        children: [
          { value: '红花岗区', label: '红花岗区' },
          { value: '汇川区', label: '汇川区' },
          { value: '播州区', label: '播州区' }
        ]
      }
    ]
  },
  {
    value: '云南省',
    label: '云南省',
    children: [
      {
        value: '昆明市',
        label: '昆明市',
        children: [
          { value: '五华区', label: '五华区' },
          { value: '盘龙区', label: '盘龙区' },
          { value: '官渡区', label: '官渡区' },
          { value: '西山区', label: '西山区' },
          { value: '呈贡区', label: '呈贡区' }
        ]
      },
      {
        value: '大理市',
        label: '大理市',
        children: [
          { value: '大理市', label: '大理市' },
          { value: '祥云县', label: '祥云县' }
        ]
      }
    ]
  },
  {
    value: '西藏自治区',
    label: '西藏自治区',
    children: [
      {
        value: '拉萨市',
        label: '拉萨市',
        children: [
          { value: '城关区', label: '城关区' },
          { value: '堆龙德庆区', label: '堆龙德庆区' },
          { value: '达孜区', label: '达孜区' }
        ]
      }
    ]
  },
  {
    value: '陕西省',
    label: '陕西省',
    children: [
      {
        value: '西安市',
        label: '西安市',
        children: [
          { value: '新城区', label: '新城区' },
          { value: '碑林区', label: '碑林区' },
          { value: '莲湖区', label: '莲湖区' },
          { value: '雁塔区', label: '雁塔区' },
          { value: '未央区', label: '未央区' },
          { value: '灞桥区', label: '灞桥区' },
          { value: '长安区', label: '长安区' }
        ]
      },
      {
        value: '宝鸡市',
        label: '宝鸡市',
        children: [
          { value: '渭滨区', label: '渭滨区' },
          { value: '金台区', label: '金台区' },
          { value: '陈仓区', label: '陈仓区' }
        ]
      }
    ]
  },
  {
    value: '甘肃省',
    label: '甘肃省',
    children: [
      {
        value: '兰州市',
        label: '兰州市',
        children: [
          { value: '城关区', label: '城关区' },
          { value: '七里河区', label: '七里河区' },
          { value: '西固区', label: '西固区' },
          { value: '安宁区', label: '安宁区' }
        ]
      },
      {
        value: '天水市',
        label: '天水市',
        children: [
          { value: '秦州区', label: '秦州区' },
          { value: '麦积区', label: '麦积区' }
        ]
      }
    ]
  },
  {
    value: '青海省',
    label: '青海省',
    children: [
      {
        value: '西宁市',
        label: '西宁市',
        children: [
          { value: '城东区', label: '城东区' },
          { value: '城中区', label: '城中区' },
          { value: '城西区', label: '城西区' },
          { value: '城北区', label: '城北区' }
        ]
      }
    ]
  },
  {
    value: '宁夏回族自治区',
    label: '宁夏回族自治区',
    children: [
      {
        value: '银川市',
        label: '银川市',
        children: [
          { value: '兴庆区', label: '兴庆区' },
          { value: '西夏区', label: '西夏区' },
          { value: '金凤区', label: '金凤区' }
        ]
      }
    ]
  },
  {
    value: '新疆维吾尔自治区',
    label: '新疆维吾尔自治区',
    children: [
      {
        value: '乌鲁木齐市',
        label: '乌鲁木齐市',
        children: [
          { value: '天山区', label: '天山区' },
          { value: '沙依巴克区', label: '沙依巴克区' },
          { value: '新市区', label: '新市区' },
          { value: '水磨沟区', label: '水磨沟区' },
          { value: '头屯河区', label: '头屯河区' }
        ]
      },
      {
        value: '克拉玛依市',
        label: '克拉玛依市',
        children: [
          { value: '克拉玛依区', label: '克拉玛依区' },
          { value: '独山子区', label: '独山子区' }
        ]
      }
    ]
  },
  {
    value: '香港特别行政区',
    label: '香港特别行政区',
    children: [
      {
        value: '香港岛',
        label: '香港岛',
        children: [
          { value: '中西区', label: '中西区' },
          { value: '湾仔区', label: '湾仔区' },
          { value: '东区', label: '东区' }
        ]
      },
      {
        value: '九龙',
        label: '九龙',
        children: [
          { value: '油尖旺区', label: '油尖旺区' },
          { value: '深水埗区', label: '深水埗区' },
          { value: '九龙城区', label: '九龙城区' }
        ]
      },
      {
        value: '新界',
        label: '新界',
        children: [
          { value: '葵青区', label: '葵青区' },
          { value: '荃湾区', label: '荃湾区' },
          { value: '屯门区', label: '屯门区' }
        ]
      }
    ]
  },
  {
    value: '澳门特别行政区',
    label: '澳门特别行政区',
    children: [
      {
        value: '澳门半岛',
        label: '澳门半岛',
        children: [
          { value: '花地玛堂区', label: '花地玛堂区' },
          { value: '圣安多尼堂区', label: '圣安多尼堂区' },
          { value: '大堂区', label: '大堂区' }
        ]
      },
      { value: '氹仔', label: '氹仔', children: [{ value: '嘉模堂区', label: '嘉模堂区' }] },
      { value: '路环', label: '路环', children: [{ value: '圣方济各堂区', label: '圣方济各堂区' }] }
    ]
  },
  {
    value: '台湾省',
    label: '台湾省',
    children: [
      {
        value: '台北市',
        label: '台北市',
        children: [
          { value: '中正区', label: '中正区' },
          { value: '大同区', label: '大同区' },
          { value: '中山区', label: '中山区' },
          { value: '大安区', label: '大安区' }
        ]
      },
      {
        value: '高雄市',
        label: '高雄市',
        children: [
          { value: '盐埕区', label: '盐埕区' },
          { value: '前金区', label: '前金区' },
          { value: '苓雅区', label: '苓雅区' }
        ]
      },
      {
        value: '新北市',
        label: '新北市',
        children: [
          { value: '板桥区', label: '板桥区' },
          { value: '三重区', label: '三重区' },
          { value: '中和区', label: '中和区' }
        ]
      }
    ]
  }
]
