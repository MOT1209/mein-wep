(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();const it=16,qt=96,mt=16,to=it*qt*mt,Ye=34,df=1,ff=600,Qs=20,Rh=1e3/Qs,co=1.8,pf=1.62,Ch=.6,yc=5.5,Ec=6.5,ps=-28,Vl=-60,mf=4.3,gf=5.9,wc=11,_f=8.6,pr=3.2,Ko=.82,vf=.995,Ac=.72,Lh=.55,Tc=3.5,xf=1,Rc=20,Si=20,Mi=20,Ei=10,Ph=9,Sf=1,Mf=4,bf=Ph*(Mf+Sf),ke=Ph,Wl=64,yf=1,Ih=6,Dh=2,Nh=12,Ef=.55,wf=160,Af=24,Tf=20,Rf=300,Cc=1.6,ei=15,We=16,wn=16,Cf=60,Lf=2,Li={low:{renderDistance:4,pixelRatioCap:1,particles:60,entityShadows:!1,clouds:!1,fogDensity:1.35},medium:{renderDistance:6,pixelRatioCap:1.5,particles:160,entityShadows:!1,clouds:!0,fogDensity:1},high:{renderDistance:9,pixelRatioCap:2,particles:320,entityShadows:!0,clouds:!0,fogDensity:.85}},Pf=.3,If=.9,Df=.2,Nf=.1,Uf=3.2,Of=7,T={AIR:0,STONE:1,GRASS:2,DIRT:3,COBBLESTONE:4,SAND:5,SANDSTONE:6,GRAVEL:7,WATER:8,LOG:9,LEAVES:10,PLANKS:11,GLASS:12,COAL_ORE:13,COPPER_ORE:14,FERRITE_ORE:15,AURUM_ORE:16,AETHERITE_ORE:17,EMBER_ORE:18,BEDROCK:19,SNOW_BLOCK:20,SNOW_GRASS:21,ICE:22,PERMAFROST:23,FROSTGLASS:24,GLOWCRYSTAL:25,ICICLE:26,CACTUS:27,TALL_GRASS:28,FLOWER_RED:29,FLOWER_YELLOW:30,FLOWER_BLUE:31,MUSHROOM_RED:32,MUSHROOM_BROWN:33,DEAD_BUSH:34,TORCH:35,CRAFTING_TABLE:36,FURNACE:37,FURNACE_LIT:38,CHEST:39,BED:40,DOOR_CLOSED:41,DOOR_OPEN:42,BRICKS:43,STONE_BRICKS:44,MOSSY_STONE:45,SANDSTONE_BRICKS:46,EMBERSTONE:47,EMBERSTONE_BRICKS:48,RUSTROCK:49,RUSTROCK_BRICKS:50,EMBERLIGHT:51,UNDERSTONE:52,UNDERSTONE_BRICKS:53,FUME_VENT:54,FARMLAND:55,FARMLAND_WET:56,WHEAT_0:57,WHEAT_1:58,WHEAT_2:59,WHEAT_3:60,LOG_PINE:61,LEAVES_PINE:62,LOG_DUNE:63,LEAVES_DUNE:64,CLAY:65,VOIDROCK:66,WOOL:67,WOOL_RED:68,WOOL_BLUE:69,WOOL_YELLOW:70,FERRO_LANTERN:71,CAMPFIRE:72,GLOWSHROOM:73,CRYSTAL_BLOCK:74,AURUM_BLOCK:75,FERRITE_BLOCK:76,COPPER_BLOCK:77,COAL_BLOCK:78,SAPLING_SABLE:79,SAPLING_PINE:80,SAPLING_DUNE:81,DEWBERRY_FULL:82,DEWBERRY_EMPTY:83},zn=[];function lt(i,t,e,n={}){const s={id:i,name:t,tiles:e,render:n.render??"cube",solid:n.solid??!0,opaque:n.opaque??!0,lightFilter:n.lightFilter??(n.opaque===!1?0:15),lightEmit:n.lightEmit??0,hardness:n.hardness??1,tool:n.tool===void 0?"pickaxe":n.tool,tier:n.tier??0,drops:n.drops??"self",material:n.material??"stone",stackSize:n.stackSize??Wl,liquid:n.liquid,replaceable:n.replaceable,flammable:n.flammable,interactive:n.interactive,growth:n.growth,needsSupport:n.needsSupport,climbable:n.climbable,creativeHidden:n.creativeHidden,fallHazard:n.fallHazard,saplingOf:n.saplingOf,plantedOn:n.plantedOn,particleTile:n.particleTile,emissiveTint:n.emissiveTint};return zn[i]=s,s}lt(T.AIR,"air",{all:"air"},{render:"cube",solid:!1,opaque:!1,lightFilter:0,hardness:0,tool:null,drops:"none",creativeHidden:!0});lt(T.STONE,"stone",{all:"stone"},{hardness:1.6,tool:"pickaxe",tier:1,drops:[{item:"cobblestone",min:1,max:1}],material:"stone"});lt(T.GRASS,"grass",{top:"grass_top",bottom:"dirt",side:"grass_side"},{hardness:.7,tool:"shovel",drops:[{item:"dirt",min:1,max:1}],material:"grass"});lt(T.DIRT,"dirt",{all:"dirt"},{hardness:.6,tool:"shovel",material:"dirt"});lt(T.COBBLESTONE,"cobblestone",{all:"cobblestone"},{hardness:1.8,tool:"pickaxe",tier:1,material:"stone"});lt(T.SAND,"sand",{all:"sand"},{hardness:.5,tool:"shovel",material:"sand"});lt(T.SANDSTONE,"sandstone",{top:"sandstone_top",bottom:"sandstone_top",side:"sandstone_side"},{hardness:1.4,tool:"pickaxe",tier:1,material:"stone"});lt(T.GRAVEL,"gravel",{all:"gravel"},{hardness:.65,tool:"shovel",material:"sand",drops:[{item:"gravel",min:1,max:1,chance:.85},{item:"stone_shard",min:1,max:1,chance:.15}]});lt(T.WATER,"water",{all:"water"},{render:"liquid",solid:!1,opaque:!1,lightFilter:1,hardness:-1,tool:null,drops:"none",liquid:!0,replaceable:!0,material:"liquid",stackSize:1,creativeHidden:!0,particleTile:"water"});lt(T.LOG,"log",{top:"log_top",bottom:"log_top",side:"log_side"},{hardness:2,tool:"axe",material:"wood",flammable:!0});lt(T.LEAVES,"leaves",{all:"leaves"},{hardness:.25,tool:"shears",opaque:!1,lightFilter:2,material:"plant",flammable:!0,drops:[{item:"sapling_sable",min:1,max:1,chance:.12},{item:"apple",min:1,max:1,chance:.05},{item:"stick",min:1,max:2,chance:.1}]});lt(T.PLANKS,"planks",{all:"planks"},{hardness:1.1,tool:"axe",material:"wood",flammable:!0});lt(T.GLASS,"glass",{all:"glass"},{hardness:.4,tool:"pickaxe",opaque:!1,lightFilter:0,drops:"none",material:"glass"});lt(T.COAL_ORE,"coal_ore",{all:"coal_ore"},{hardness:2.2,tool:"pickaxe",tier:1,drops:[{item:"coal",min:1,max:1}],material:"stone"});lt(T.COPPER_ORE,"copper_ore",{all:"copper_ore"},{hardness:2.4,tool:"pickaxe",tier:1,drops:[{item:"raw_copper",min:2,max:3}],material:"stone"});lt(T.FERRITE_ORE,"ferrite_ore",{all:"ferrite_ore"},{hardness:2.8,tool:"pickaxe",tier:2,drops:[{item:"raw_ferrite",min:1,max:1}],material:"stone"});lt(T.AURUM_ORE,"aurum_ore",{all:"aurum_ore"},{hardness:3,tool:"pickaxe",tier:3,drops:[{item:"raw_aurum",min:1,max:1}],material:"stone"});lt(T.AETHERITE_ORE,"aetherite_ore",{all:"aetherite_ore"},{hardness:3.4,tool:"pickaxe",tier:3,drops:[{item:"aetherite_gem",min:1,max:1}],material:"gem"});lt(T.EMBER_ORE,"ember_ore",{all:"ember_ore"},{hardness:2.9,tool:"pickaxe",tier:2,drops:[{item:"ember_dust",min:3,max:5}],material:"stone",lightEmit:4});lt(T.BEDROCK,"bedrock",{all:"bedrock"},{hardness:-1,tool:"pickaxe",tier:99,drops:"none",material:"stone",creativeHidden:!0});lt(T.SNOW_BLOCK,"snow_block",{all:"snow"},{hardness:.4,tool:"shovel",material:"snow"});lt(T.SNOW_GRASS,"snow_grass",{top:"snow",bottom:"dirt",side:"snow_grass_side"},{hardness:.7,tool:"shovel",drops:[{item:"dirt",min:1,max:1}],material:"snow"});lt(T.ICE,"ice",{all:"ice"},{hardness:.6,tool:"pickaxe",tier:1,opaque:!1,lightFilter:3,drops:"none",material:"glass"});lt(T.PERMAFROST,"permafrost",{all:"permafrost"},{hardness:2.4,tool:"pickaxe",tier:1,material:"stone"});lt(T.FROSTGLASS,"frostglass",{all:"frostglass"},{hardness:.7,tool:"pickaxe",tier:1,opaque:!1,lightFilter:2,drops:"self",material:"glass"});lt(T.GLOWCRYSTAL,"glowcrystal",{all:"glowcrystal"},{hardness:.8,tool:"pickaxe",tier:1,opaque:!1,lightFilter:4,lightEmit:13,material:"gem",needsSupport:!0});lt(T.ICICLE,"icicle",{all:"icicle"},{render:"cross",solid:!1,opaque:!1,lightFilter:0,hardness:.3,tool:"pickaxe",drops:"none",material:"glass",needsSupport:!0,fallHazard:!0});lt(T.CACTUS,"cactus",{top:"cactus_top",bottom:"cactus_top",side:"cactus_side"},{hardness:.6,tool:null,material:"plant",needsSupport:!0});lt(T.TALL_GRASS,"tall_grass",{all:"tall_grass"},{render:"cross",solid:!1,opaque:!1,lightFilter:1,hardness:.1,tool:"shears",material:"plant",flammable:!0,needsSupport:!0,drops:[{item:"seeds",min:1,max:2,chance:.3},{item:"tall_grass",min:1,max:1,chance:.6}]});lt(T.FLOWER_RED,"flower_red",{all:"flower_red"},{render:"cross",solid:!1,opaque:!1,lightFilter:1,hardness:.1,tool:null,material:"plant",needsSupport:!0});lt(T.FLOWER_YELLOW,"flower_yellow",{all:"flower_yellow"},{render:"cross",solid:!1,opaque:!1,lightFilter:1,hardness:.1,tool:null,material:"plant",needsSupport:!0});lt(T.FLOWER_BLUE,"flower_blue",{all:"flower_blue"},{render:"cross",solid:!1,opaque:!1,lightFilter:1,hardness:.1,tool:null,material:"plant",needsSupport:!0});lt(T.MUSHROOM_RED,"mushroom_red",{all:"mushroom_red"},{render:"cross",solid:!1,opaque:!1,lightFilter:1,hardness:.1,tool:null,material:"plant",needsSupport:!0});lt(T.MUSHROOM_BROWN,"mushroom_brown",{all:"mushroom_brown"},{render:"cross",solid:!1,opaque:!1,lightFilter:1,hardness:.1,tool:null,material:"plant",needsSupport:!0});lt(T.DEAD_BUSH,"dead_bush",{all:"dead_bush"},{render:"cross",solid:!1,opaque:!1,lightFilter:1,hardness:.1,tool:null,material:"plant",flammable:!0,needsSupport:!0,drops:[{item:"stick",min:1,max:2,chance:.7}]});lt(T.TORCH,"torch",{all:"torch"},{render:"cross",solid:!1,opaque:!1,lightFilter:0,lightEmit:14,hardness:.05,tool:null,material:"wood",needsSupport:!0,emissiveTint:[1,.85,.5],particleTile:"torch"});lt(T.CRAFTING_TABLE,"crafting_table",{top:"crafting_table_top",bottom:"planks",side:"crafting_table_side",front:"crafting_table_front"},{hardness:1.6,tool:"axe",material:"wood",interactive:"crafting",flammable:!0});lt(T.FURNACE,"furnace",{top:"furnace_top",bottom:"furnace_top",side:"furnace_side",front:"furnace_front"},{hardness:2.4,tool:"pickaxe",tier:1,material:"stone",interactive:"furnace"});lt(T.FURNACE_LIT,"furnace_lit",{top:"furnace_top",bottom:"furnace_top",side:"furnace_side",front:"furnace_front_lit"},{hardness:2.4,tool:"pickaxe",tier:1,material:"stone",interactive:"furnace",lightEmit:12,drops:[{item:"furnace",min:1,max:1}],creativeHidden:!0,emissiveTint:[1,.7,.35]});lt(T.CHEST,"chest",{top:"chest_top",bottom:"chest_top",side:"chest_side",front:"chest_front"},{hardness:1.6,tool:"axe",material:"wood",interactive:"chest",flammable:!0});lt(T.BED,"bed",{top:"bed_top",bottom:"planks",side:"bed_side"},{render:"cube",solid:!0,hardness:.9,tool:null,material:"wool",interactive:"bed",opaque:!1,lightFilter:0,stackSize:1});lt(T.DOOR_CLOSED,"door_closed",{all:"door"},{hardness:1.4,tool:"axe",material:"wood",interactive:"door",opaque:!1,lightFilter:0,drops:[{item:"door_closed",min:1,max:1}],stackSize:1});lt(T.DOOR_OPEN,"door_open",{all:"door"},{hardness:1.4,tool:"axe",material:"wood",interactive:"door",solid:!1,opaque:!1,lightFilter:0,drops:[{item:"door_closed",min:1,max:1}],creativeHidden:!0,stackSize:1});lt(T.BRICKS,"bricks",{all:"bricks"},{hardness:2.1,tool:"pickaxe",tier:1,material:"stone"});lt(T.STONE_BRICKS,"stone_bricks",{all:"stone_bricks"},{hardness:2,tool:"pickaxe",tier:1,material:"stone"});lt(T.MOSSY_STONE,"mossy_stone",{all:"mossy_stone"},{hardness:2,tool:"pickaxe",tier:1,material:"stone"});lt(T.SANDSTONE_BRICKS,"sandstone_bricks",{all:"sandstone_bricks"},{hardness:1.8,tool:"pickaxe",tier:1,material:"stone"});lt(T.EMBERSTONE,"emberstone",{all:"emberstone"},{hardness:2.6,tool:"pickaxe",tier:2,material:"stone"});lt(T.EMBERSTONE_BRICKS,"emberstone_bricks",{all:"emberstone_bricks"},{hardness:2.6,tool:"pickaxe",tier:2,material:"stone"});lt(T.RUSTROCK,"rustrock",{all:"rustrock"},{hardness:2.6,tool:"pickaxe",tier:2,material:"stone"});lt(T.RUSTROCK_BRICKS,"rustrock_bricks",{all:"rustrock_bricks"},{hardness:2.6,tool:"pickaxe",tier:2,material:"stone"});lt(T.EMBERLIGHT,"emberlight",{all:"emberlight"},{hardness:1.2,tool:"pickaxe",tier:1,material:"gem",lightEmit:15,emissiveTint:[1,.75,.4]});lt(T.UNDERSTONE,"understone",{all:"understone"},{hardness:2.2,tool:"pickaxe",tier:1,drops:[{item:"cobbled_understone",min:1,max:1}],material:"stone"});lt(T.UNDERSTONE_BRICKS,"understone_bricks",{all:"understone_bricks"},{hardness:2.2,tool:"pickaxe",tier:1,material:"stone"});lt(T.FUME_VENT,"fume_vent",{all:"fume_vent"},{hardness:2,tool:"pickaxe",tier:1,material:"stone",interactive:"fume"});lt(T.FARMLAND,"farmland",{top:"farmland",bottom:"dirt",side:"dirt"},{hardness:.6,tool:"shovel",drops:[{item:"dirt",min:1,max:1}],material:"dirt"});lt(T.FARMLAND_WET,"farmland_wet",{top:"farmland_wet",bottom:"dirt",side:"dirt"},{hardness:.6,tool:"shovel",drops:[{item:"dirt",min:1,max:1}],material:"dirt",creativeHidden:!0});const kf=["wheat_0","wheat_1","wheat_2","wheat_3"];for(let i=0;i<4;i++)lt(T.WHEAT_0+i,`wheat_${i}`,{all:kf[i]},{render:"cross",solid:!1,opaque:!1,lightFilter:0,hardness:.05,tool:null,material:"plant",needsSupport:!0,growth:{stage:i,next:i<3?T.WHEAT_0+i+1:null,crop:"wheat"},drops:i===3?[{item:"wheat",min:1,max:1},{item:"seeds",min:1,max:3}]:[{item:"seeds",min:1,max:1}],creativeHidden:i!==3,stackSize:Wl});lt(T.LOG_PINE,"log_pine",{top:"log_pine_top",bottom:"log_pine_top",side:"log_pine_side"},{hardness:2,tool:"axe",material:"wood",flammable:!0});lt(T.LEAVES_PINE,"leaves_pine",{all:"leaves_pine"},{hardness:.25,tool:"shears",opaque:!1,lightFilter:2,material:"plant",flammable:!0,drops:[{item:"sapling_pine",min:1,max:1,chance:.12},{item:"stick",min:1,max:2,chance:.08}]});lt(T.LOG_DUNE,"log_dune",{top:"log_dune_top",bottom:"log_dune_top",side:"log_dune_side"},{hardness:2,tool:"axe",material:"wood",flammable:!0});lt(T.LEAVES_DUNE,"leaves_dune",{all:"leaves_dune"},{hardness:.25,tool:"shears",opaque:!1,lightFilter:2,material:"plant",flammable:!0,drops:[{item:"sapling_dune",min:1,max:1,chance:.12}]});lt(T.CLAY,"clay",{all:"clay"},{hardness:.6,tool:"shovel",drops:[{item:"clay_ball",min:4,max:4}],material:"dirt"});lt(T.VOIDROCK,"voidrock",{all:"voidrock"},{hardness:8,tool:"pickaxe",tier:3,material:"stone"});lt(T.WOOL,"wool",{all:"wool_white"},{hardness:.8,tool:null,material:"wool",flammable:!0});lt(T.WOOL_RED,"wool_red",{all:"wool_red"},{hardness:.8,tool:null,material:"wool",flammable:!0});lt(T.WOOL_BLUE,"wool_blue",{all:"wool_blue"},{hardness:.8,tool:null,material:"wool",flammable:!0});lt(T.WOOL_YELLOW,"wool_yellow",{all:"wool_yellow"},{hardness:.8,tool:null,material:"wool",flammable:!0});lt(T.FERRO_LANTERN,"ferro_lantern",{all:"ferro_lantern"},{hardness:1.4,tool:"pickaxe",tier:1,material:"metal",lightEmit:15,emissiveTint:[1,.9,.7]});lt(T.CAMPFIRE,"campfire",{top:"campfire_top",bottom:"log_top",side:"campfire_side"},{hardness:1.2,tool:"axe",material:"wood",lightEmit:13,opaque:!1,lightFilter:0,solid:!1,emissiveTint:[1,.6,.3]});lt(T.GLOWSHROOM,"glowshroom",{all:"glowshroom"},{render:"cross",solid:!1,opaque:!1,lightFilter:0,lightEmit:7,hardness:.1,tool:null,material:"plant",needsSupport:!0,emissiveTint:[.5,.9,1]});lt(T.CRYSTAL_BLOCK,"crystal_block",{all:"crystal_block"},{hardness:2.4,tool:"pickaxe",tier:3,material:"gem",opaque:!1,lightFilter:3});lt(T.AURUM_BLOCK,"aurum_block",{all:"aurum_block"},{hardness:2.6,tool:"pickaxe",tier:3,material:"metal"});lt(T.FERRITE_BLOCK,"ferrite_block",{all:"ferrite_block"},{hardness:3.2,tool:"pickaxe",tier:2,material:"metal"});lt(T.COPPER_BLOCK,"copper_block",{all:"copper_block"},{hardness:2.8,tool:"pickaxe",tier:2,material:"metal"});lt(T.COAL_BLOCK,"coal_block",{all:"coal_block"},{hardness:2.4,tool:"pickaxe",tier:1,material:"stone",flammable:!0});lt(T.SAPLING_SABLE,"sapling_sable",{all:"sapling_sable"},{render:"cross",solid:!1,opaque:!1,lightFilter:0,hardness:.05,tool:null,material:"plant",needsSupport:!0,plantedOn:["grass","dirt","farmland"],saplingOf:"tree_sable"});lt(T.SAPLING_PINE,"sapling_pine",{all:"sapling_pine"},{render:"cross",solid:!1,opaque:!1,lightFilter:0,hardness:.05,tool:null,material:"plant",needsSupport:!0,plantedOn:["grass","dirt","snow_grass","snow_block","farmland"],saplingOf:"tree_pine"});lt(T.SAPLING_DUNE,"sapling_dune",{all:"sapling_dune"},{render:"cross",solid:!1,opaque:!1,lightFilter:0,hardness:.05,tool:null,material:"plant",needsSupport:!0,plantedOn:["sand","dirt","farmland"],saplingOf:"tree_dune"});lt(T.DEWBERRY_FULL,"dewberry_full",{all:"dewberry_full"},{render:"cross",solid:!1,opaque:!1,lightFilter:0,hardness:.1,tool:null,material:"plant",needsSupport:!0,growth:{stage:1,next:null,crop:"dewberry"},drops:[{item:"dewberry",min:1,max:2},{item:"dewberry_full",min:1,max:1,chance:.5}]});lt(T.DEWBERRY_EMPTY,"dewberry_empty",{all:"dewberry_empty"},{render:"cross",solid:!1,opaque:!1,lightFilter:0,hardness:.1,tool:null,material:"plant",needsSupport:!0,growth:{stage:0,next:T.DEWBERRY_FULL,crop:"dewberry"},drops:[{item:"dewberry_empty",min:1,max:1,chance:.5}],creativeHidden:!0});const No=zn;function ce(i){const t=zn[i];return t||zn[0]}const Ff=new Map;for(const i of zn)i&&Ff.set(i.name,i);function Fe(i){const t=zn[i];return t?t.solid:!1}function or(i){return zn[i]?.liquid===!0}function Xl(i){const t=zn[i];return t?t.lightFilter:15}function Uh(i){const t=zn[i];return t?t.lightEmit:0}const Yl=new Set(["air","water","furnace_lit","door_open","farmland_wet"]),Bf=new Set([T.WHEAT_0,T.WHEAT_1,T.WHEAT_2,T.WHEAT_3,T.DEWBERRY_EMPTY]),zf=new Set([T.AIR,T.WATER,T.TALL_GRASS,T.DEAD_BUSH,T.FLOWER_RED,T.FLOWER_YELLOW,T.FLOWER_BLUE,T.MUSHROOM_RED,T.MUSHROOM_BROWN,T.SNOW_BLOCK]);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const ql="168",Hf=0,Lc=1,Gf=2,Oh=1,Vf=2,kn=3,ri=0,je=1,_n=2,ni=0,cs=1,Pc=2,Ic=3,Dc=4,Wf=5,wi=100,Xf=101,Yf=102,qf=103,$f=104,Kf=200,jf=201,Zf=202,Jf=203,Za=204,Ja=205,Qf=206,tp=207,ep=208,np=209,ip=210,sp=211,rp=212,op=213,ap=214,lp=0,cp=1,up=2,uo=3,hp=4,dp=5,fp=6,pp=7,kh=0,mp=1,gp=2,ii=0,_p=1,vp=2,xp=3,Sp=4,Mp=5,bp=6,yp=7,Fh=300,ms=301,gs=302,Qa=303,tl=304,Uo=306,tr=1e3,Fn=1001,el=1002,we=1003,Ep=1004,mr=1005,vn=1006,jo=1007,Ti=1008,Hn=1009,Bh=1010,zh=1011,er=1012,$l=1013,Pi=1014,Tn=1015,ar=1016,Kl=1017,jl=1018,_s=1020,Hh=35902,Gh=1021,Vh=1022,xn=1023,Wh=1024,Xh=1025,us=1026,vs=1027,Zl=1028,Jl=1029,Yh=1030,Ql=1031,tc=1033,eo=33776,no=33777,io=33778,so=33779,nl=35840,il=35841,sl=35842,rl=35843,ol=36196,al=37492,ll=37496,cl=37808,ul=37809,hl=37810,dl=37811,fl=37812,pl=37813,ml=37814,gl=37815,_l=37816,vl=37817,xl=37818,Sl=37819,Ml=37820,bl=37821,ro=36492,yl=36494,El=36495,qh=36283,wl=36284,Al=36285,Tl=36286,wp=3200,Ap=3201,Tp=0,Rp=1,ti="",on="srgb",ai="srgb-linear",ec="display-p3",Oo="display-p3-linear",ho="linear",de="srgb",fo="rec709",po="p3",Ui=7680,Nc=519,Cp=512,Lp=513,Pp=514,$h=515,Ip=516,Dp=517,Np=518,Up=519,Rl=35044,Op=35048,Uc="300 es",Bn=2e3,mo=2001;class ys{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const s=this._listeners[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}}const Ue=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],oo=Math.PI/180,Cl=180/Math.PI;function si(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ue[i&255]+Ue[i>>8&255]+Ue[i>>16&255]+Ue[i>>24&255]+"-"+Ue[t&255]+Ue[t>>8&255]+"-"+Ue[t>>16&15|64]+Ue[t>>24&255]+"-"+Ue[e&63|128]+Ue[e>>8&255]+"-"+Ue[e>>16&255]+Ue[e>>24&255]+Ue[n&255]+Ue[n>>8&255]+Ue[n>>16&255]+Ue[n>>24&255]).toLowerCase()}function $e(i,t,e){return Math.max(t,Math.min(e,i))}function kp(i,t){return(i%t+t)%t}function Zo(i,t,e){return(1-e)*i+e*t}function An(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function le(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class Kt{constructor(t=0,e=0){Kt.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos($e(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Vt{constructor(t,e,n,s,r,o,a,l,c){Vt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c)}set(t,e,n,s,r,o,a,l,c){const u=this.elements;return u[0]=t,u[1]=s,u[2]=a,u[3]=e,u[4]=r,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],h=n[7],d=n[2],f=n[5],g=n[8],_=s[0],p=s[3],m=s[6],y=s[1],M=s[4],A=s[7],U=s[2],C=s[5],E=s[8];return r[0]=o*_+a*y+l*U,r[3]=o*p+a*M+l*C,r[6]=o*m+a*A+l*E,r[1]=c*_+u*y+h*U,r[4]=c*p+u*M+h*C,r[7]=c*m+u*A+h*E,r[2]=d*_+f*y+g*U,r[5]=d*p+f*M+g*C,r[8]=d*m+f*A+g*E,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],u=t[8];return e*o*u-e*a*c-n*r*u+n*a*l+s*r*c-s*o*l}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],u=t[8],h=u*o-a*c,d=a*l-u*r,f=c*r-o*l,g=e*h+n*d+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return t[0]=h*_,t[1]=(s*c-u*n)*_,t[2]=(a*n-s*o)*_,t[3]=d*_,t[4]=(u*e-s*l)*_,t[5]=(s*r-a*e)*_,t[6]=f*_,t[7]=(n*l-c*e)*_,t[8]=(o*e-n*r)*_,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-s*c,s*l,-s*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(Jo.makeScale(t,e)),this}rotate(t){return this.premultiply(Jo.makeRotation(-t)),this}translate(t,e){return this.premultiply(Jo.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Jo=new Vt;function Kh(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function go(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Fp(){const i=go("canvas");return i.style.display="block",i}const Oc={};function hs(i){i in Oc||(Oc[i]=!0,console.warn(i))}function Bp(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}const kc=new Vt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Fc=new Vt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Ls={[ai]:{transfer:ho,primaries:fo,luminanceCoefficients:[.2126,.7152,.0722],toReference:i=>i,fromReference:i=>i},[on]:{transfer:de,primaries:fo,luminanceCoefficients:[.2126,.7152,.0722],toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[Oo]:{transfer:ho,primaries:po,luminanceCoefficients:[.2289,.6917,.0793],toReference:i=>i.applyMatrix3(Fc),fromReference:i=>i.applyMatrix3(kc)},[ec]:{transfer:de,primaries:po,luminanceCoefficients:[.2289,.6917,.0793],toReference:i=>i.convertSRGBToLinear().applyMatrix3(Fc),fromReference:i=>i.applyMatrix3(kc).convertLinearToSRGB()}},zp=new Set([ai,Oo]),oe={enabled:!0,_workingColorSpace:ai,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!zp.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,t,e){if(this.enabled===!1||t===e||!t||!e)return i;const n=Ls[t].toReference,s=Ls[e].fromReference;return s(n(i))},fromWorkingColorSpace:function(i,t){return this.convert(i,this._workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this._workingColorSpace)},getPrimaries:function(i){return Ls[i].primaries},getTransfer:function(i){return i===ti?ho:Ls[i].transfer},getLuminanceCoefficients:function(i,t=this._workingColorSpace){return i.fromArray(Ls[t].luminanceCoefficients)}};function ds(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Qo(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let Oi;class Hp{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Oi===void 0&&(Oi=go("canvas")),Oi.width=t.width,Oi.height=t.height;const n=Oi.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=Oi}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=go("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=ds(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(ds(e[n]/255)*255):e[n]=ds(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let Gp=0;class jh{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Gp++}),this.uuid=si(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(ta(s[o].image)):r.push(ta(s[o]))}else r=ta(s);n.url=r}return e||(t.images[this.uuid]=n),n}}function ta(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Hp.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Vp=0;class Be extends ys{constructor(t=Be.DEFAULT_IMAGE,e=Be.DEFAULT_MAPPING,n=Fn,s=Fn,r=vn,o=Ti,a=xn,l=Hn,c=Be.DEFAULT_ANISOTROPY,u=ti){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Vp++}),this.uuid=si(),this.name="",this.source=new jh(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Kt(0,0),this.repeat=new Kt(1,1),this.center=new Kt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Vt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Fh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case tr:t.x=t.x-Math.floor(t.x);break;case Fn:t.x=t.x<0?0:1;break;case el:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case tr:t.y=t.y-Math.floor(t.y);break;case Fn:t.y=t.y<0?0:1;break;case el:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Be.DEFAULT_IMAGE=null;Be.DEFAULT_MAPPING=Fh;Be.DEFAULT_ANISOTROPY=1;class Le{constructor(t=0,e=0,n=0,s=1){Le.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r;const l=t.elements,c=l[0],u=l[4],h=l[8],d=l[1],f=l[5],g=l[9],_=l[2],p=l[6],m=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-_)<.01&&Math.abs(g-p)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+_)<.1&&Math.abs(g+p)<.1&&Math.abs(c+f+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const M=(c+1)/2,A=(f+1)/2,U=(m+1)/2,C=(u+d)/4,E=(h+_)/4,P=(g+p)/4;return M>A&&M>U?M<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(M),s=C/n,r=E/n):A>U?A<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(A),n=C/s,r=P/s):U<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(U),n=E/r,s=P/r),this.set(n,s,r,e),this}let y=Math.sqrt((p-g)*(p-g)+(h-_)*(h-_)+(d-u)*(d-u));return Math.abs(y)<.001&&(y=1),this.x=(p-g)/y,this.y=(h-_)/y,this.z=(d-u)/y,this.w=Math.acos((c+f+m-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Wp extends ys{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new Le(0,0,t,e),this.scissorTest=!1,this.viewport=new Le(0,0,t,e);const s={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:vn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new Be(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new jh(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ii extends Wp{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class Zh extends Be{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=we,this.minFilter=we,this.wrapR=Fn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class Xp extends Be{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=we,this.minFilter=we,this.wrapR=Fn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Es{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let l=n[s+0],c=n[s+1],u=n[s+2],h=n[s+3];const d=r[o+0],f=r[o+1],g=r[o+2],_=r[o+3];if(a===0){t[e+0]=l,t[e+1]=c,t[e+2]=u,t[e+3]=h;return}if(a===1){t[e+0]=d,t[e+1]=f,t[e+2]=g,t[e+3]=_;return}if(h!==_||l!==d||c!==f||u!==g){let p=1-a;const m=l*d+c*f+u*g+h*_,y=m>=0?1:-1,M=1-m*m;if(M>Number.EPSILON){const U=Math.sqrt(M),C=Math.atan2(U,m*y);p=Math.sin(p*C)/U,a=Math.sin(a*C)/U}const A=a*y;if(l=l*p+d*A,c=c*p+f*A,u=u*p+g*A,h=h*p+_*A,p===1-a){const U=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=U,c*=U,u*=U,h*=U}}t[e]=l,t[e+1]=c,t[e+2]=u,t[e+3]=h}static multiplyQuaternionsFlat(t,e,n,s,r,o){const a=n[s],l=n[s+1],c=n[s+2],u=n[s+3],h=r[o],d=r[o+1],f=r[o+2],g=r[o+3];return t[e]=a*g+u*h+l*f-c*d,t[e+1]=l*g+u*d+c*h-a*f,t[e+2]=c*g+u*f+a*d-l*h,t[e+3]=u*g-a*h-l*d-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(s/2),h=a(r/2),d=l(n/2),f=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"YXZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"ZXY":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"ZYX":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"YZX":this._x=d*u*h+c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h-d*f*g;break;case"XZY":this._x=d*u*h-c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],u=e[6],h=e[10],d=n+a+h;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(n>a&&n>h){const f=2*Math.sqrt(1+n-a-h);this._w=(u-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>h){const f=2*Math.sqrt(1+a-n-h);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+u)/f}else{const f=2*Math.sqrt(1+h-n-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs($e(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,u=e._w;return this._x=n*u+o*a+s*c-r*l,this._y=s*u+o*l+r*a-n*c,this._z=r*u+o*c+n*l-s*a,this._w=o*u-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,s=this._y,r=this._z,o=this._w;let a=o*t._w+n*t._x+s*t._y+r*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-e;return this._w=f*o+e*this._w,this._x=f*n+e*this._x,this._y=f*s+e*this._y,this._z=f*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-e)*u)/c,d=Math.sin(e*u)/c;return this._w=o*h+this._w*d,this._x=n*h+this._x*d,this._y=s*h+this._y*d,this._z=r*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class k{constructor(t=0,e=0,n=0){k.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Bc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Bc.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*s-a*n),u=2*(a*e-r*s),h=2*(r*n-o*e);return this.x=e+l*c+o*h-a*u,this.y=n+l*u+a*c-r*h,this.z=s+l*h+r*u-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return ea.copy(this).projectOnVector(t),this.sub(ea)}reflect(t){return this.sub(ea.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos($e(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const ea=new k,Bc=new Es;class Di{constructor(t=new k(1/0,1/0,1/0),e=new k(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(fn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(fn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=fn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,fn):fn.fromBufferAttribute(r,o),fn.applyMatrix4(t.matrixWorld),this.expandByPoint(fn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),gr.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),gr.copy(n.boundingBox)),gr.applyMatrix4(t.matrixWorld),this.union(gr)}const s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,fn),fn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ps),_r.subVectors(this.max,Ps),ki.subVectors(t.a,Ps),Fi.subVectors(t.b,Ps),Bi.subVectors(t.c,Ps),Wn.subVectors(Fi,ki),Xn.subVectors(Bi,Fi),di.subVectors(ki,Bi);let e=[0,-Wn.z,Wn.y,0,-Xn.z,Xn.y,0,-di.z,di.y,Wn.z,0,-Wn.x,Xn.z,0,-Xn.x,di.z,0,-di.x,-Wn.y,Wn.x,0,-Xn.y,Xn.x,0,-di.y,di.x,0];return!na(e,ki,Fi,Bi,_r)||(e=[1,0,0,0,1,0,0,0,1],!na(e,ki,Fi,Bi,_r))?!1:(vr.crossVectors(Wn,Xn),e=[vr.x,vr.y,vr.z],na(e,ki,Fi,Bi,_r))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,fn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(fn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Pn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Pn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Pn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Pn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Pn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Pn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Pn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Pn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Pn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const Pn=[new k,new k,new k,new k,new k,new k,new k,new k],fn=new k,gr=new Di,ki=new k,Fi=new k,Bi=new k,Wn=new k,Xn=new k,di=new k,Ps=new k,_r=new k,vr=new k,fi=new k;function na(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){fi.fromArray(i,r);const a=s.x*Math.abs(fi.x)+s.y*Math.abs(fi.y)+s.z*Math.abs(fi.z),l=t.dot(fi),c=e.dot(fi),u=n.dot(fi);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}const Yp=new Di,Is=new k,ia=new k;class ws{constructor(t=new k,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):Yp.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Is.subVectors(t,this.center);const e=Is.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Is,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(ia.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Is.copy(t.center).add(ia)),this.expandByPoint(Is.copy(t.center).sub(ia))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const In=new k,sa=new k,xr=new k,Yn=new k,ra=new k,Sr=new k,oa=new k;class Jh{constructor(t=new k,e=new k(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,In)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=In.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(In.copy(this.origin).addScaledVector(this.direction,e),In.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){sa.copy(t).add(e).multiplyScalar(.5),xr.copy(e).sub(t).normalize(),Yn.copy(this.origin).sub(sa);const r=t.distanceTo(e)*.5,o=-this.direction.dot(xr),a=Yn.dot(this.direction),l=-Yn.dot(xr),c=Yn.lengthSq(),u=Math.abs(1-o*o);let h,d,f,g;if(u>0)if(h=o*l-a,d=o*a-l,g=r*u,h>=0)if(d>=-g)if(d<=g){const _=1/u;h*=_,d*=_,f=h*(h+o*d+2*a)+d*(o*h+d+2*l)+c}else d=r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d=-r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d<=-g?(h=Math.max(0,-(-o*r+a)),d=h>0?-r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c):d<=g?(h=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(h=Math.max(0,-(o*r+a)),d=h>0?r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c);else d=o>0?-r:r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(sa).addScaledVector(xr,d),f}intersectSphere(t,e){In.subVectors(t.center,this.origin);const n=In.dot(this.direction),s=In.dot(In)-n*n,r=t.radius*t.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,l;const c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(n=(t.min.x-d.x)*c,s=(t.max.x-d.x)*c):(n=(t.max.x-d.x)*c,s=(t.min.x-d.x)*c),u>=0?(r=(t.min.y-d.y)*u,o=(t.max.y-d.y)*u):(r=(t.max.y-d.y)*u,o=(t.min.y-d.y)*u),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(t.min.z-d.z)*h,l=(t.max.z-d.z)*h):(a=(t.max.z-d.z)*h,l=(t.min.z-d.z)*h),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,In)!==null}intersectTriangle(t,e,n,s,r){ra.subVectors(e,t),Sr.subVectors(n,t),oa.crossVectors(ra,Sr);let o=this.direction.dot(oa),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Yn.subVectors(this.origin,t);const l=a*this.direction.dot(Sr.crossVectors(Yn,Sr));if(l<0)return null;const c=a*this.direction.dot(ra.cross(Yn));if(c<0||l+c>o)return null;const u=-a*Yn.dot(oa);return u<0?null:this.at(u/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class fe{constructor(t,e,n,s,r,o,a,l,c,u,h,d,f,g,_,p){fe.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c,u,h,d,f,g,_,p)}set(t,e,n,s,r,o,a,l,c,u,h,d,f,g,_,p){const m=this.elements;return m[0]=t,m[4]=e,m[8]=n,m[12]=s,m[1]=r,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=u,m[10]=h,m[14]=d,m[3]=f,m[7]=g,m[11]=_,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new fe().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,s=1/zi.setFromMatrixColumn(t,0).length(),r=1/zi.setFromMatrixColumn(t,1).length(),o=1/zi.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(t.order==="XYZ"){const d=o*u,f=o*h,g=a*u,_=a*h;e[0]=l*u,e[4]=-l*h,e[8]=c,e[1]=f+g*c,e[5]=d-_*c,e[9]=-a*l,e[2]=_-d*c,e[6]=g+f*c,e[10]=o*l}else if(t.order==="YXZ"){const d=l*u,f=l*h,g=c*u,_=c*h;e[0]=d+_*a,e[4]=g*a-f,e[8]=o*c,e[1]=o*h,e[5]=o*u,e[9]=-a,e[2]=f*a-g,e[6]=_+d*a,e[10]=o*l}else if(t.order==="ZXY"){const d=l*u,f=l*h,g=c*u,_=c*h;e[0]=d-_*a,e[4]=-o*h,e[8]=g+f*a,e[1]=f+g*a,e[5]=o*u,e[9]=_-d*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){const d=o*u,f=o*h,g=a*u,_=a*h;e[0]=l*u,e[4]=g*c-f,e[8]=d*c+_,e[1]=l*h,e[5]=_*c+d,e[9]=f*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){const d=o*l,f=o*c,g=a*l,_=a*c;e[0]=l*u,e[4]=_-d*h,e[8]=g*h+f,e[1]=h,e[5]=o*u,e[9]=-a*u,e[2]=-c*u,e[6]=f*h+g,e[10]=d-_*h}else if(t.order==="XZY"){const d=o*l,f=o*c,g=a*l,_=a*c;e[0]=l*u,e[4]=-h,e[8]=c*u,e[1]=d*h+_,e[5]=o*u,e[9]=f*h-g,e[2]=g*h-f,e[6]=a*u,e[10]=_*h+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(qp,t,$p)}lookAt(t,e,n){const s=this.elements;return tn.subVectors(t,e),tn.lengthSq()===0&&(tn.z=1),tn.normalize(),qn.crossVectors(n,tn),qn.lengthSq()===0&&(Math.abs(n.z)===1?tn.x+=1e-4:tn.z+=1e-4,tn.normalize(),qn.crossVectors(n,tn)),qn.normalize(),Mr.crossVectors(tn,qn),s[0]=qn.x,s[4]=Mr.x,s[8]=tn.x,s[1]=qn.y,s[5]=Mr.y,s[9]=tn.y,s[2]=qn.z,s[6]=Mr.z,s[10]=tn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],h=n[5],d=n[9],f=n[13],g=n[2],_=n[6],p=n[10],m=n[14],y=n[3],M=n[7],A=n[11],U=n[15],C=s[0],E=s[4],P=s[8],b=s[12],x=s[1],L=s[5],B=s[9],G=s[13],j=s[2],Y=s[6],W=s[10],$=s[14],V=s[3],ht=s[7],ft=s[11],Mt=s[15];return r[0]=o*C+a*x+l*j+c*V,r[4]=o*E+a*L+l*Y+c*ht,r[8]=o*P+a*B+l*W+c*ft,r[12]=o*b+a*G+l*$+c*Mt,r[1]=u*C+h*x+d*j+f*V,r[5]=u*E+h*L+d*Y+f*ht,r[9]=u*P+h*B+d*W+f*ft,r[13]=u*b+h*G+d*$+f*Mt,r[2]=g*C+_*x+p*j+m*V,r[6]=g*E+_*L+p*Y+m*ht,r[10]=g*P+_*B+p*W+m*ft,r[14]=g*b+_*G+p*$+m*Mt,r[3]=y*C+M*x+A*j+U*V,r[7]=y*E+M*L+A*Y+U*ht,r[11]=y*P+M*B+A*W+U*ft,r[15]=y*b+M*G+A*$+U*Mt,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],u=t[2],h=t[6],d=t[10],f=t[14],g=t[3],_=t[7],p=t[11],m=t[15];return g*(+r*l*h-s*c*h-r*a*d+n*c*d+s*a*f-n*l*f)+_*(+e*l*f-e*c*d+r*o*d-s*o*f+s*c*u-r*l*u)+p*(+e*c*h-e*a*f-r*o*h+n*o*f+r*a*u-n*c*u)+m*(-s*a*u-e*l*h+e*a*d+s*o*h-n*o*d+n*l*u)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],u=t[8],h=t[9],d=t[10],f=t[11],g=t[12],_=t[13],p=t[14],m=t[15],y=h*p*c-_*d*c+_*l*f-a*p*f-h*l*m+a*d*m,M=g*d*c-u*p*c-g*l*f+o*p*f+u*l*m-o*d*m,A=u*_*c-g*h*c+g*a*f-o*_*f-u*a*m+o*h*m,U=g*h*l-u*_*l-g*a*d+o*_*d+u*a*p-o*h*p,C=e*y+n*M+s*A+r*U;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const E=1/C;return t[0]=y*E,t[1]=(_*d*r-h*p*r-_*s*f+n*p*f+h*s*m-n*d*m)*E,t[2]=(a*p*r-_*l*r+_*s*c-n*p*c-a*s*m+n*l*m)*E,t[3]=(h*l*r-a*d*r-h*s*c+n*d*c+a*s*f-n*l*f)*E,t[4]=M*E,t[5]=(u*p*r-g*d*r+g*s*f-e*p*f-u*s*m+e*d*m)*E,t[6]=(g*l*r-o*p*r-g*s*c+e*p*c+o*s*m-e*l*m)*E,t[7]=(o*d*r-u*l*r+u*s*c-e*d*c-o*s*f+e*l*f)*E,t[8]=A*E,t[9]=(g*h*r-u*_*r-g*n*f+e*_*f+u*n*m-e*h*m)*E,t[10]=(o*_*r-g*a*r+g*n*c-e*_*c-o*n*m+e*a*m)*E,t[11]=(u*a*r-o*h*r-u*n*c+e*h*c+o*n*f-e*a*f)*E,t[12]=U*E,t[13]=(u*_*s-g*h*s+g*n*d-e*_*d-u*n*p+e*h*p)*E,t[14]=(g*a*s-o*_*s-g*n*l+e*_*l+o*n*p-e*a*p)*E,t[15]=(o*h*s-u*a*s+u*n*l-e*h*l-o*n*d+e*a*d)*E,this}scale(t){const e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,c=r*o,u=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,u*a+n,u*l-s*o,0,c*l-s*a,u*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,u=o+o,h=a+a,d=r*c,f=r*u,g=r*h,_=o*u,p=o*h,m=a*h,y=l*c,M=l*u,A=l*h,U=n.x,C=n.y,E=n.z;return s[0]=(1-(_+m))*U,s[1]=(f+A)*U,s[2]=(g-M)*U,s[3]=0,s[4]=(f-A)*C,s[5]=(1-(d+m))*C,s[6]=(p+y)*C,s[7]=0,s[8]=(g+M)*E,s[9]=(p-y)*E,s[10]=(1-(d+_))*E,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;let r=zi.set(s[0],s[1],s[2]).length();const o=zi.set(s[4],s[5],s[6]).length(),a=zi.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],pn.copy(this);const c=1/r,u=1/o,h=1/a;return pn.elements[0]*=c,pn.elements[1]*=c,pn.elements[2]*=c,pn.elements[4]*=u,pn.elements[5]*=u,pn.elements[6]*=u,pn.elements[8]*=h,pn.elements[9]*=h,pn.elements[10]*=h,e.setFromRotationMatrix(pn),n.x=r,n.y=o,n.z=a,this}makePerspective(t,e,n,s,r,o,a=Bn){const l=this.elements,c=2*r/(e-t),u=2*r/(n-s),h=(e+t)/(e-t),d=(n+s)/(n-s);let f,g;if(a===Bn)f=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===mo)f=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=Bn){const l=this.elements,c=1/(e-t),u=1/(n-s),h=1/(o-r),d=(e+t)*c,f=(n+s)*u;let g,_;if(a===Bn)g=(o+r)*h,_=-2*h;else if(a===mo)g=r*h,_=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const zi=new k,pn=new fe,qp=new k(0,0,0),$p=new k(1,1,1),qn=new k,Mr=new k,tn=new k,zc=new fe,Hc=new Es;class Gn{constructor(t=0,e=0,n=0,s=Gn.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],u=s[9],h=s[2],d=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin($e(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-$e(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin($e(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-$e(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin($e(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-$e(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return zc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(zc,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Hc.setFromEuler(this),this.setFromQuaternion(Hc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Gn.DEFAULT_ORDER="XYZ";class Qh{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let Kp=0;const Gc=new k,Hi=new Es,Dn=new fe,br=new k,Ds=new k,jp=new k,Zp=new Es,Vc=new k(1,0,0),Wc=new k(0,1,0),Xc=new k(0,0,1),Yc={type:"added"},Jp={type:"removed"},Gi={type:"childadded",child:null},aa={type:"childremoved",child:null};class ze extends ys{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Kp++}),this.uuid=si(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ze.DEFAULT_UP.clone();const t=new k,e=new Gn,n=new Es,s=new k(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new fe},normalMatrix:{value:new Vt}}),this.matrix=new fe,this.matrixWorld=new fe,this.matrixAutoUpdate=ze.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ze.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Qh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Hi.setFromAxisAngle(t,e),this.quaternion.multiply(Hi),this}rotateOnWorldAxis(t,e){return Hi.setFromAxisAngle(t,e),this.quaternion.premultiply(Hi),this}rotateX(t){return this.rotateOnAxis(Vc,t)}rotateY(t){return this.rotateOnAxis(Wc,t)}rotateZ(t){return this.rotateOnAxis(Xc,t)}translateOnAxis(t,e){return Gc.copy(t).applyQuaternion(this.quaternion),this.position.add(Gc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Vc,t)}translateY(t){return this.translateOnAxis(Wc,t)}translateZ(t){return this.translateOnAxis(Xc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Dn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?br.copy(t):br.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Ds.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Dn.lookAt(Ds,br,this.up):Dn.lookAt(br,Ds,this.up),this.quaternion.setFromRotationMatrix(Dn),s&&(Dn.extractRotation(s.matrixWorld),Hi.setFromRotationMatrix(Dn),this.quaternion.premultiply(Hi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Yc),Gi.child=t,this.dispatchEvent(Gi),Gi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Jp),aa.child=t,this.dispatchEvent(aa),aa.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Dn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Dn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Dn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Yc),Gi.child=t,this.dispatchEvent(Gi),Gi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ds,t,jp),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ds,Zp,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const h=l[c];r(t.shapes,h)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(t.animations,l))}}if(e){const a=o(t.geometries),l=o(t.materials),c=o(t.textures),u=o(t.images),h=o(t.shapes),d=o(t.skeletons),f=o(t.animations),g=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){const l=[];for(const c in a){const u=a[c];delete u.metadata,l.push(u)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}}ze.DEFAULT_UP=new k(0,1,0);ze.DEFAULT_MATRIX_AUTO_UPDATE=!0;ze.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const mn=new k,Nn=new k,la=new k,Un=new k,Vi=new k,Wi=new k,qc=new k,ca=new k,ua=new k,ha=new k;class ln{constructor(t=new k,e=new k,n=new k){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),mn.subVectors(t,e),s.cross(mn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){mn.subVectors(s,e),Nn.subVectors(n,e),la.subVectors(t,e);const o=mn.dot(mn),a=mn.dot(Nn),l=mn.dot(la),c=Nn.dot(Nn),u=Nn.dot(la),h=o*c-a*a;if(h===0)return r.set(0,0,0),null;const d=1/h,f=(c*l-a*u)*d,g=(o*u-a*l)*d;return r.set(1-f-g,g,f)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Un)===null?!1:Un.x>=0&&Un.y>=0&&Un.x+Un.y<=1}static getInterpolation(t,e,n,s,r,o,a,l){return this.getBarycoord(t,e,n,s,Un)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Un.x),l.addScaledVector(o,Un.y),l.addScaledVector(a,Un.z),l)}static isFrontFacing(t,e,n,s){return mn.subVectors(n,e),Nn.subVectors(t,e),mn.cross(Nn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return mn.subVectors(this.c,this.b),Nn.subVectors(this.a,this.b),mn.cross(Nn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return ln.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return ln.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return ln.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return ln.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return ln.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,r=this.c;let o,a;Vi.subVectors(s,n),Wi.subVectors(r,n),ca.subVectors(t,n);const l=Vi.dot(ca),c=Wi.dot(ca);if(l<=0&&c<=0)return e.copy(n);ua.subVectors(t,s);const u=Vi.dot(ua),h=Wi.dot(ua);if(u>=0&&h<=u)return e.copy(s);const d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return o=l/(l-u),e.copy(n).addScaledVector(Vi,o);ha.subVectors(t,r);const f=Vi.dot(ha),g=Wi.dot(ha);if(g>=0&&f<=g)return e.copy(r);const _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(n).addScaledVector(Wi,a);const p=u*g-f*h;if(p<=0&&h-u>=0&&f-g>=0)return qc.subVectors(r,s),a=(h-u)/(h-u+(f-g)),e.copy(s).addScaledVector(qc,a);const m=1/(p+_+d);return o=_*m,a=d*m,e.copy(n).addScaledVector(Vi,o).addScaledVector(Wi,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const td={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},$n={h:0,s:0,l:0},yr={h:0,s:0,l:0};function da(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class Zt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=on){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,oe.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=oe.workingColorSpace){return this.r=t,this.g=e,this.b=n,oe.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=oe.workingColorSpace){if(t=kp(t,1),e=$e(e,0,1),n=$e(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=da(o,r,t+1/3),this.g=da(o,r,t),this.b=da(o,r,t-1/3)}return oe.toWorkingColorSpace(this,s),this}setStyle(t,e=on){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=on){const n=td[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=ds(t.r),this.g=ds(t.g),this.b=ds(t.b),this}copyLinearToSRGB(t){return this.r=Qo(t.r),this.g=Qo(t.g),this.b=Qo(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=on){return oe.fromWorkingColorSpace(Oe.copy(this),t),Math.round($e(Oe.r*255,0,255))*65536+Math.round($e(Oe.g*255,0,255))*256+Math.round($e(Oe.b*255,0,255))}getHexString(t=on){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=oe.workingColorSpace){oe.fromWorkingColorSpace(Oe.copy(this),e);const n=Oe.r,s=Oe.g,r=Oe.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let l,c;const u=(a+o)/2;if(a===o)l=0,c=0;else{const h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case n:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-n)/h+2;break;case r:l=(n-s)/h+4;break}l/=6}return t.h=l,t.s=c,t.l=u,t}getRGB(t,e=oe.workingColorSpace){return oe.fromWorkingColorSpace(Oe.copy(this),e),t.r=Oe.r,t.g=Oe.g,t.b=Oe.b,t}getStyle(t=on){oe.fromWorkingColorSpace(Oe.copy(this),t);const e=Oe.r,n=Oe.g,s=Oe.b;return t!==on?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL($n),this.setHSL($n.h+t,$n.s+e,$n.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL($n),t.getHSL(yr);const n=Zo($n.h,yr.h,e),s=Zo($n.s,yr.s,e),r=Zo($n.l,yr.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Oe=new Zt;Zt.NAMES=td;let Qp=0;class As extends ys{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Qp++}),this.uuid=si(),this.name="",this.type="Material",this.blending=cs,this.side=ri,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Za,this.blendDst=Ja,this.blendEquation=wi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Zt(0,0,0),this.blendAlpha=0,this.depthFunc=uo,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Nc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ui,this.stencilZFail=Ui,this.stencilZPass=Ui,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==cs&&(n.blending=this.blending),this.side!==ri&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Za&&(n.blendSrc=this.blendSrc),this.blendDst!==Ja&&(n.blendDst=this.blendDst),this.blendEquation!==wi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==uo&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Nc&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ui&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ui&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ui&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(e){const r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class lr extends As{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Zt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Gn,this.combine=kh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const ye=new k,Er=new Kt;class Ae{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Rl,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=Tn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}get updateRange(){return hs("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Er.fromBufferAttribute(this,e),Er.applyMatrix3(t),this.setXY(e,Er.x,Er.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)ye.fromBufferAttribute(this,e),ye.applyMatrix3(t),this.setXYZ(e,ye.x,ye.y,ye.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)ye.fromBufferAttribute(this,e),ye.applyMatrix4(t),this.setXYZ(e,ye.x,ye.y,ye.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)ye.fromBufferAttribute(this,e),ye.applyNormalMatrix(t),this.setXYZ(e,ye.x,ye.y,ye.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)ye.fromBufferAttribute(this,e),ye.transformDirection(t),this.setXYZ(e,ye.x,ye.y,ye.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=An(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=le(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=An(e,this.array)),e}setX(t,e){return this.normalized&&(e=le(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=An(e,this.array)),e}setY(t,e){return this.normalized&&(e=le(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=An(e,this.array)),e}setZ(t,e){return this.normalized&&(e=le(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=An(e,this.array)),e}setW(t,e){return this.normalized&&(e=le(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=le(e,this.array),n=le(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=le(e,this.array),n=le(n,this.array),s=le(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=le(e,this.array),n=le(n,this.array),s=le(s,this.array),r=le(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Rl&&(t.usage=this.usage),t}}class ed extends Ae{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class nd extends Ae{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class Rn extends Ae{constructor(t,e,n){super(new Float32Array(t),e,n)}}let tm=0;const rn=new fe,fa=new ze,Xi=new k,en=new Di,Ns=new Di,Ce=new k;class Mn extends ys{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:tm++}),this.uuid=si(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Kh(t)?nd:ed)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Vt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return rn.makeRotationFromQuaternion(t),this.applyMatrix4(rn),this}rotateX(t){return rn.makeRotationX(t),this.applyMatrix4(rn),this}rotateY(t){return rn.makeRotationY(t),this.applyMatrix4(rn),this}rotateZ(t){return rn.makeRotationZ(t),this.applyMatrix4(rn),this}translate(t,e,n){return rn.makeTranslation(t,e,n),this.applyMatrix4(rn),this}scale(t,e,n){return rn.makeScale(t,e,n),this.applyMatrix4(rn),this}lookAt(t){return fa.lookAt(t),fa.updateMatrix(),this.applyMatrix4(fa.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Xi).negate(),this.translate(Xi.x,Xi.y,Xi.z),this}setFromPoints(t){const e=[];for(let n=0,s=t.length;n<s;n++){const r=t[n];e.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new Rn(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Di);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new k(-1/0,-1/0,-1/0),new k(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const r=e[n];en.setFromBufferAttribute(r),this.morphTargetsRelative?(Ce.addVectors(this.boundingBox.min,en.min),this.boundingBox.expandByPoint(Ce),Ce.addVectors(this.boundingBox.max,en.max),this.boundingBox.expandByPoint(Ce)):(this.boundingBox.expandByPoint(en.min),this.boundingBox.expandByPoint(en.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ws);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new k,1/0);return}if(t){const n=this.boundingSphere.center;if(en.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){const a=e[r];Ns.setFromBufferAttribute(a),this.morphTargetsRelative?(Ce.addVectors(en.min,Ns.min),en.expandByPoint(Ce),Ce.addVectors(en.max,Ns.max),en.expandByPoint(Ce)):(en.expandByPoint(Ns.min),en.expandByPoint(Ns.max))}en.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)Ce.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Ce));if(e)for(let r=0,o=e.length;r<o;r++){const a=e[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)Ce.fromBufferAttribute(a,c),l&&(Xi.fromBufferAttribute(t,c),Ce.add(Xi)),s=Math.max(s,n.distanceToSquared(Ce))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ae(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let P=0;P<n.count;P++)a[P]=new k,l[P]=new k;const c=new k,u=new k,h=new k,d=new Kt,f=new Kt,g=new Kt,_=new k,p=new k;function m(P,b,x){c.fromBufferAttribute(n,P),u.fromBufferAttribute(n,b),h.fromBufferAttribute(n,x),d.fromBufferAttribute(r,P),f.fromBufferAttribute(r,b),g.fromBufferAttribute(r,x),u.sub(c),h.sub(c),f.sub(d),g.sub(d);const L=1/(f.x*g.y-g.x*f.y);isFinite(L)&&(_.copy(u).multiplyScalar(g.y).addScaledVector(h,-f.y).multiplyScalar(L),p.copy(h).multiplyScalar(f.x).addScaledVector(u,-g.x).multiplyScalar(L),a[P].add(_),a[b].add(_),a[x].add(_),l[P].add(p),l[b].add(p),l[x].add(p))}let y=this.groups;y.length===0&&(y=[{start:0,count:t.count}]);for(let P=0,b=y.length;P<b;++P){const x=y[P],L=x.start,B=x.count;for(let G=L,j=L+B;G<j;G+=3)m(t.getX(G+0),t.getX(G+1),t.getX(G+2))}const M=new k,A=new k,U=new k,C=new k;function E(P){U.fromBufferAttribute(s,P),C.copy(U);const b=a[P];M.copy(b),M.sub(U.multiplyScalar(U.dot(b))).normalize(),A.crossVectors(C,b);const L=A.dot(l[P])<0?-1:1;o.setXYZW(P,M.x,M.y,M.z,L)}for(let P=0,b=y.length;P<b;++P){const x=y[P],L=x.start,B=x.count;for(let G=L,j=L+B;G<j;G+=3)E(t.getX(G+0)),E(t.getX(G+1)),E(t.getX(G+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ae(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const s=new k,r=new k,o=new k,a=new k,l=new k,c=new k,u=new k,h=new k;if(t)for(let d=0,f=t.count;d<f;d+=3){const g=t.getX(d+0),_=t.getX(d+1),p=t.getX(d+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,_),o.fromBufferAttribute(e,p),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,p),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let d=0,f=e.count;d<f;d+=3)s.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Ce.fromBufferAttribute(t,e),Ce.normalize(),t.setXYZ(e,Ce.x,Ce.y,Ce.z)}toNonIndexed(){function t(a,l){const c=a.array,u=a.itemSize,h=a.normalized,d=new c.constructor(l.length*u);let f=0,g=0;for(let _=0,p=l.length;_<p;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*u;for(let m=0;m<u;m++)d[g++]=c[f++]}return new Ae(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Mn,n=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=t(l,n);e.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let u=0,h=c.length;u<h;u++){const d=c[u],f=t(d,n);l.push(f)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){const f=c[h];u.push(f.toJSON(t.data))}u.length>0&&(s[l]=u,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const s=t.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(e))}const r=t.morphAttributes;for(const c in r){const u=[],h=r[c];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(e));this.morphAttributes[c]=u}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let c=0,u=o.length;c<u;c++){const h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const $c=new fe,pi=new Jh,wr=new ws,Kc=new k,Yi=new k,qi=new k,$i=new k,pa=new k,Ar=new k,Tr=new Kt,Rr=new Kt,Cr=new Kt,jc=new k,Zc=new k,Jc=new k,Lr=new k,Pr=new k;class Ke extends ze{constructor(t=new Mn,e=new lr){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const a=this.morphTargetInfluences;if(r&&a){Ar.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=a[l],h=r[l];u!==0&&(pa.fromBufferAttribute(h,t),o?Ar.addScaledVector(pa,u):Ar.addScaledVector(pa.sub(e),u))}e.add(Ar)}return e}raycast(t,e){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),wr.copy(n.boundingSphere),wr.applyMatrix4(r),pi.copy(t.ray).recast(t.near),!(wr.containsPoint(pi.origin)===!1&&(pi.intersectSphere(wr,Kc)===null||pi.origin.distanceToSquared(Kc)>(t.far-t.near)**2))&&($c.copy(r).invert(),pi.copy(t.ray).applyMatrix4($c),!(n.boundingBox!==null&&pi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,pi)))}_computeIntersections(t,e,n){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){const p=d[g],m=o[p.materialIndex],y=Math.max(p.start,f.start),M=Math.min(a.count,Math.min(p.start+p.count,f.start+f.count));for(let A=y,U=M;A<U;A+=3){const C=a.getX(A),E=a.getX(A+1),P=a.getX(A+2);s=Ir(this,m,t,n,c,u,h,C,E,P),s&&(s.faceIndex=Math.floor(A/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{const g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let p=g,m=_;p<m;p+=3){const y=a.getX(p),M=a.getX(p+1),A=a.getX(p+2);s=Ir(this,o,t,n,c,u,h,y,M,A),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){const p=d[g],m=o[p.materialIndex],y=Math.max(p.start,f.start),M=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let A=y,U=M;A<U;A+=3){const C=A,E=A+1,P=A+2;s=Ir(this,m,t,n,c,u,h,C,E,P),s&&(s.faceIndex=Math.floor(A/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{const g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let p=g,m=_;p<m;p+=3){const y=p,M=p+1,A=p+2;s=Ir(this,o,t,n,c,u,h,y,M,A),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}}}function em(i,t,e,n,s,r,o,a){let l;if(t.side===je?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,t.side===ri,a),l===null)return null;Pr.copy(a),Pr.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(Pr);return c<e.near||c>e.far?null:{distance:c,point:Pr.clone(),object:i}}function Ir(i,t,e,n,s,r,o,a,l,c){i.getVertexPosition(a,Yi),i.getVertexPosition(l,qi),i.getVertexPosition(c,$i);const u=em(i,t,e,n,Yi,qi,$i,Lr);if(u){s&&(Tr.fromBufferAttribute(s,a),Rr.fromBufferAttribute(s,l),Cr.fromBufferAttribute(s,c),u.uv=ln.getInterpolation(Lr,Yi,qi,$i,Tr,Rr,Cr,new Kt)),r&&(Tr.fromBufferAttribute(r,a),Rr.fromBufferAttribute(r,l),Cr.fromBufferAttribute(r,c),u.uv1=ln.getInterpolation(Lr,Yi,qi,$i,Tr,Rr,Cr,new Kt)),o&&(jc.fromBufferAttribute(o,a),Zc.fromBufferAttribute(o,l),Jc.fromBufferAttribute(o,c),u.normal=ln.getInterpolation(Lr,Yi,qi,$i,jc,Zc,Jc,new k),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const h={a,b:l,c,normal:new k,materialIndex:0};ln.getNormal(Yi,qi,$i,h.normal),u.face=h}return u}class li extends Mn{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],u=[],h=[];let d=0,f=0;g("z","y","x",-1,-1,n,e,t,o,r,0),g("z","y","x",1,-1,n,e,-t,o,r,1),g("x","z","y",1,1,t,n,e,s,o,2),g("x","z","y",1,-1,t,n,-e,s,o,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Rn(c,3)),this.setAttribute("normal",new Rn(u,3)),this.setAttribute("uv",new Rn(h,2));function g(_,p,m,y,M,A,U,C,E,P,b){const x=A/E,L=U/P,B=A/2,G=U/2,j=C/2,Y=E+1,W=P+1;let $=0,V=0;const ht=new k;for(let ft=0;ft<W;ft++){const Mt=ft*L-G;for(let kt=0;kt<Y;kt++){const ee=kt*x-B;ht[_]=ee*y,ht[p]=Mt*M,ht[m]=j,c.push(ht.x,ht.y,ht.z),ht[_]=0,ht[p]=0,ht[m]=C>0?1:-1,u.push(ht.x,ht.y,ht.z),h.push(kt/E),h.push(1-ft/P),$+=1}}for(let ft=0;ft<P;ft++)for(let Mt=0;Mt<E;Mt++){const kt=d+Mt+Y*ft,ee=d+Mt+Y*(ft+1),X=d+(Mt+1)+Y*(ft+1),nt=d+(Mt+1)+Y*ft;l.push(kt,ee,nt),l.push(ee,X,nt),V+=6}a.addGroup(f,V,b),f+=V,d+=$}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new li(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function xs(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function Ve(i){const t={};for(let e=0;e<i.length;e++){const n=xs(i[e]);for(const s in n)t[s]=n[s]}return t}function nm(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function id(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:oe.workingColorSpace}const im={clone:xs,merge:Ve};var sm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,rm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Sn extends As{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=sm,this.fragmentShader=rm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=xs(t.uniforms),this.uniformsGroups=nm(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class sd extends ze{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new fe,this.projectionMatrix=new fe,this.projectionMatrixInverse=new fe,this.coordinateSystem=Bn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Kn=new k,Qc=new Kt,tu=new Kt;class an extends sd{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Cl*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(oo*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Cl*2*Math.atan(Math.tan(oo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Kn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Kn.x,Kn.y).multiplyScalar(-t/Kn.z),Kn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Kn.x,Kn.y).multiplyScalar(-t/Kn.z)}getViewSize(t,e){return this.getViewBounds(t,Qc,tu),e.subVectors(tu,Qc)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(oo*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,e-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Ki=-90,ji=1;class om extends ze{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new an(Ki,ji,t,e);s.layers=this.layers,this.add(s);const r=new an(Ki,ji,t,e);r.layers=this.layers,this.add(r);const o=new an(Ki,ji,t,e);o.layers=this.layers,this.add(o);const a=new an(Ki,ji,t,e);a.layers=this.layers,this.add(a);const l=new an(Ki,ji,t,e);l.layers=this.layers,this.add(l);const c=new an(Ki,ji,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,l]=e;for(const c of e)this.remove(c);if(t===Bn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===mo)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,u]=this.children,h=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,o),t.setRenderTarget(n,2,s),t.render(e,a),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=_,t.setRenderTarget(n,5,s),t.render(e,u),t.setRenderTarget(h,d,f),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class rd extends Be{constructor(t,e,n,s,r,o,a,l,c,u){t=t!==void 0?t:[],e=e!==void 0?e:ms,super(t,e,n,s,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class am extends Ii{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new rd(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:vn}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new li(5,5,5),r=new Sn({name:"CubemapFromEquirect",uniforms:xs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:je,blending:ni});r.uniforms.tEquirect.value=e;const o=new Ke(s,r),a=e.minFilter;return e.minFilter===Ti&&(e.minFilter=vn),new om(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,n,s){const r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}}const ma=new k,lm=new k,cm=new Vt;class bi{constructor(t=new k(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=ma.subVectors(n,e).cross(lm.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(ma),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||cm.getNormalMatrix(t),s=this.coplanarPoint(ma).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const mi=new ws,Dr=new k;class od{constructor(t=new bi,e=new bi,n=new bi,s=new bi,r=new bi,o=new bi){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Bn){const n=this.planes,s=t.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],u=s[5],h=s[6],d=s[7],f=s[8],g=s[9],_=s[10],p=s[11],m=s[12],y=s[13],M=s[14],A=s[15];if(n[0].setComponents(l-r,d-c,p-f,A-m).normalize(),n[1].setComponents(l+r,d+c,p+f,A+m).normalize(),n[2].setComponents(l+o,d+u,p+g,A+y).normalize(),n[3].setComponents(l-o,d-u,p-g,A-y).normalize(),n[4].setComponents(l-a,d-h,p-_,A-M).normalize(),e===Bn)n[5].setComponents(l+a,d+h,p+_,A+M).normalize();else if(e===mo)n[5].setComponents(a,h,_,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),mi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),mi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(mi)}intersectsSprite(t){return mi.center.set(0,0,0),mi.radius=.7071067811865476,mi.applyMatrix4(t.matrixWorld),this.intersectsSphere(mi)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(Dr.x=s.normal.x>0?t.max.x:t.min.x,Dr.y=s.normal.y>0?t.max.y:t.min.y,Dr.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Dr)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function ad(){let i=null,t=!1,e=null,n=null;function s(r,o){e(r,o),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function um(i){const t=new WeakMap;function e(a,l){const c=a.array,u=a.usage,h=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,u),a.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,l,c){const u=l.array,h=l._updateRange,d=l.updateRanges;if(i.bindBuffer(c,a),h.count===-1&&d.length===0&&i.bufferSubData(c,0,u),d.length!==0){for(let f=0,g=d.length;f<g;f++){const _=d[f];i.bufferSubData(c,_.start*u.BYTES_PER_ELEMENT,u,_.start,_.count)}l.clearUpdateRanges()}h.count!==-1&&(i.bufferSubData(c,h.offset*u.BYTES_PER_ELEMENT,u,h.offset,h.count),h.count=-1),l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=t.get(a);l&&(i.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const u=t.get(a);(!u||u.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}class cr extends Mn{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(s),c=a+1,u=l+1,h=t/a,d=e/l,f=[],g=[],_=[],p=[];for(let m=0;m<u;m++){const y=m*d-o;for(let M=0;M<c;M++){const A=M*h-r;g.push(A,-y,0),_.push(0,0,1),p.push(M/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let y=0;y<a;y++){const M=y+c*m,A=y+c*(m+1),U=y+1+c*(m+1),C=y+1+c*m;f.push(M,A,C),f.push(A,U,C)}this.setIndex(f),this.setAttribute("position",new Rn(g,3)),this.setAttribute("normal",new Rn(_,3)),this.setAttribute("uv",new Rn(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new cr(t.width,t.height,t.widthSegments,t.heightSegments)}}var hm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,dm=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,fm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,pm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,mm=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,gm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,_m=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,vm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,xm=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Sm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Mm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,bm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,ym=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Em=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,wm=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Am=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Tm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Rm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Cm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Lm=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Pm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Im=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Dm=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Nm=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Um=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Om=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,km=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Fm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Bm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,zm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Hm="gl_FragColor = linearToOutputTexel( gl_FragColor );",Gm=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Vm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Wm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Xm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Ym=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,qm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,$m=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Km=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,jm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Zm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Jm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Qm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,tg=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,eg=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,ng=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,ig=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,sg=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,rg=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,og=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,ag=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lg=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,cg=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,ug=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,hg=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,dg=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,fg=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,pg=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,mg=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,gg=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,_g=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,vg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,xg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Sg=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Mg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,bg=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,yg=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Eg=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,wg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ag=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Tg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Rg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Cg=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Lg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Pg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ig=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Dg=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Ng=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Ug=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Og=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,kg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Fg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Bg=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,zg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Hg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Gg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Vg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Wg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Xg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Yg=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,qg=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,$g=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Kg=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,jg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Zg=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Jg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Qg=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,t_=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,e_=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,n_=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,i_=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,s_=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,r_=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,o_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,a_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,l_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,c_=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const u_=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,h_=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,d_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,f_=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,p_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,m_=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,g_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,__=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,v_=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,x_=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,S_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,M_=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,b_=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,y_=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,E_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,w_=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,A_=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,T_=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,R_=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,C_=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,L_=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,P_=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,I_=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,D_=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,N_=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,U_=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,O_=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,k_=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,F_=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,B_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,z_=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,H_=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,G_=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,V_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Gt={alphahash_fragment:hm,alphahash_pars_fragment:dm,alphamap_fragment:fm,alphamap_pars_fragment:pm,alphatest_fragment:mm,alphatest_pars_fragment:gm,aomap_fragment:_m,aomap_pars_fragment:vm,batching_pars_vertex:xm,batching_vertex:Sm,begin_vertex:Mm,beginnormal_vertex:bm,bsdfs:ym,iridescence_fragment:Em,bumpmap_pars_fragment:wm,clipping_planes_fragment:Am,clipping_planes_pars_fragment:Tm,clipping_planes_pars_vertex:Rm,clipping_planes_vertex:Cm,color_fragment:Lm,color_pars_fragment:Pm,color_pars_vertex:Im,color_vertex:Dm,common:Nm,cube_uv_reflection_fragment:Um,defaultnormal_vertex:Om,displacementmap_pars_vertex:km,displacementmap_vertex:Fm,emissivemap_fragment:Bm,emissivemap_pars_fragment:zm,colorspace_fragment:Hm,colorspace_pars_fragment:Gm,envmap_fragment:Vm,envmap_common_pars_fragment:Wm,envmap_pars_fragment:Xm,envmap_pars_vertex:Ym,envmap_physical_pars_fragment:ig,envmap_vertex:qm,fog_vertex:$m,fog_pars_vertex:Km,fog_fragment:jm,fog_pars_fragment:Zm,gradientmap_pars_fragment:Jm,lightmap_pars_fragment:Qm,lights_lambert_fragment:tg,lights_lambert_pars_fragment:eg,lights_pars_begin:ng,lights_toon_fragment:sg,lights_toon_pars_fragment:rg,lights_phong_fragment:og,lights_phong_pars_fragment:ag,lights_physical_fragment:lg,lights_physical_pars_fragment:cg,lights_fragment_begin:ug,lights_fragment_maps:hg,lights_fragment_end:dg,logdepthbuf_fragment:fg,logdepthbuf_pars_fragment:pg,logdepthbuf_pars_vertex:mg,logdepthbuf_vertex:gg,map_fragment:_g,map_pars_fragment:vg,map_particle_fragment:xg,map_particle_pars_fragment:Sg,metalnessmap_fragment:Mg,metalnessmap_pars_fragment:bg,morphinstance_vertex:yg,morphcolor_vertex:Eg,morphnormal_vertex:wg,morphtarget_pars_vertex:Ag,morphtarget_vertex:Tg,normal_fragment_begin:Rg,normal_fragment_maps:Cg,normal_pars_fragment:Lg,normal_pars_vertex:Pg,normal_vertex:Ig,normalmap_pars_fragment:Dg,clearcoat_normal_fragment_begin:Ng,clearcoat_normal_fragment_maps:Ug,clearcoat_pars_fragment:Og,iridescence_pars_fragment:kg,opaque_fragment:Fg,packing:Bg,premultiplied_alpha_fragment:zg,project_vertex:Hg,dithering_fragment:Gg,dithering_pars_fragment:Vg,roughnessmap_fragment:Wg,roughnessmap_pars_fragment:Xg,shadowmap_pars_fragment:Yg,shadowmap_pars_vertex:qg,shadowmap_vertex:$g,shadowmask_pars_fragment:Kg,skinbase_vertex:jg,skinning_pars_vertex:Zg,skinning_vertex:Jg,skinnormal_vertex:Qg,specularmap_fragment:t_,specularmap_pars_fragment:e_,tonemapping_fragment:n_,tonemapping_pars_fragment:i_,transmission_fragment:s_,transmission_pars_fragment:r_,uv_pars_fragment:o_,uv_pars_vertex:a_,uv_vertex:l_,worldpos_vertex:c_,background_vert:u_,background_frag:h_,backgroundCube_vert:d_,backgroundCube_frag:f_,cube_vert:p_,cube_frag:m_,depth_vert:g_,depth_frag:__,distanceRGBA_vert:v_,distanceRGBA_frag:x_,equirect_vert:S_,equirect_frag:M_,linedashed_vert:b_,linedashed_frag:y_,meshbasic_vert:E_,meshbasic_frag:w_,meshlambert_vert:A_,meshlambert_frag:T_,meshmatcap_vert:R_,meshmatcap_frag:C_,meshnormal_vert:L_,meshnormal_frag:P_,meshphong_vert:I_,meshphong_frag:D_,meshphysical_vert:N_,meshphysical_frag:U_,meshtoon_vert:O_,meshtoon_frag:k_,points_vert:F_,points_frag:B_,shadow_vert:z_,shadow_frag:H_,sprite_vert:G_,sprite_frag:V_},ut={common:{diffuse:{value:new Zt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Vt},alphaMap:{value:null},alphaMapTransform:{value:new Vt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Vt}},envmap:{envMap:{value:null},envMapRotation:{value:new Vt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Vt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Vt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Vt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Vt},normalScale:{value:new Kt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Vt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Vt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Vt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Vt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Zt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Zt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Vt},alphaTest:{value:0},uvTransform:{value:new Vt}},sprite:{diffuse:{value:new Zt(16777215)},opacity:{value:1},center:{value:new Kt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Vt},alphaMap:{value:null},alphaMapTransform:{value:new Vt},alphaTest:{value:0}}},En={basic:{uniforms:Ve([ut.common,ut.specularmap,ut.envmap,ut.aomap,ut.lightmap,ut.fog]),vertexShader:Gt.meshbasic_vert,fragmentShader:Gt.meshbasic_frag},lambert:{uniforms:Ve([ut.common,ut.specularmap,ut.envmap,ut.aomap,ut.lightmap,ut.emissivemap,ut.bumpmap,ut.normalmap,ut.displacementmap,ut.fog,ut.lights,{emissive:{value:new Zt(0)}}]),vertexShader:Gt.meshlambert_vert,fragmentShader:Gt.meshlambert_frag},phong:{uniforms:Ve([ut.common,ut.specularmap,ut.envmap,ut.aomap,ut.lightmap,ut.emissivemap,ut.bumpmap,ut.normalmap,ut.displacementmap,ut.fog,ut.lights,{emissive:{value:new Zt(0)},specular:{value:new Zt(1118481)},shininess:{value:30}}]),vertexShader:Gt.meshphong_vert,fragmentShader:Gt.meshphong_frag},standard:{uniforms:Ve([ut.common,ut.envmap,ut.aomap,ut.lightmap,ut.emissivemap,ut.bumpmap,ut.normalmap,ut.displacementmap,ut.roughnessmap,ut.metalnessmap,ut.fog,ut.lights,{emissive:{value:new Zt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Gt.meshphysical_vert,fragmentShader:Gt.meshphysical_frag},toon:{uniforms:Ve([ut.common,ut.aomap,ut.lightmap,ut.emissivemap,ut.bumpmap,ut.normalmap,ut.displacementmap,ut.gradientmap,ut.fog,ut.lights,{emissive:{value:new Zt(0)}}]),vertexShader:Gt.meshtoon_vert,fragmentShader:Gt.meshtoon_frag},matcap:{uniforms:Ve([ut.common,ut.bumpmap,ut.normalmap,ut.displacementmap,ut.fog,{matcap:{value:null}}]),vertexShader:Gt.meshmatcap_vert,fragmentShader:Gt.meshmatcap_frag},points:{uniforms:Ve([ut.points,ut.fog]),vertexShader:Gt.points_vert,fragmentShader:Gt.points_frag},dashed:{uniforms:Ve([ut.common,ut.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Gt.linedashed_vert,fragmentShader:Gt.linedashed_frag},depth:{uniforms:Ve([ut.common,ut.displacementmap]),vertexShader:Gt.depth_vert,fragmentShader:Gt.depth_frag},normal:{uniforms:Ve([ut.common,ut.bumpmap,ut.normalmap,ut.displacementmap,{opacity:{value:1}}]),vertexShader:Gt.meshnormal_vert,fragmentShader:Gt.meshnormal_frag},sprite:{uniforms:Ve([ut.sprite,ut.fog]),vertexShader:Gt.sprite_vert,fragmentShader:Gt.sprite_frag},background:{uniforms:{uvTransform:{value:new Vt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Gt.background_vert,fragmentShader:Gt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Vt}},vertexShader:Gt.backgroundCube_vert,fragmentShader:Gt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Gt.cube_vert,fragmentShader:Gt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Gt.equirect_vert,fragmentShader:Gt.equirect_frag},distanceRGBA:{uniforms:Ve([ut.common,ut.displacementmap,{referencePosition:{value:new k},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Gt.distanceRGBA_vert,fragmentShader:Gt.distanceRGBA_frag},shadow:{uniforms:Ve([ut.lights,ut.fog,{color:{value:new Zt(0)},opacity:{value:1}}]),vertexShader:Gt.shadow_vert,fragmentShader:Gt.shadow_frag}};En.physical={uniforms:Ve([En.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Vt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Vt},clearcoatNormalScale:{value:new Kt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Vt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Vt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Vt},sheen:{value:0},sheenColor:{value:new Zt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Vt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Vt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Vt},transmissionSamplerSize:{value:new Kt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Vt},attenuationDistance:{value:0},attenuationColor:{value:new Zt(0)},specularColor:{value:new Zt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Vt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Vt},anisotropyVector:{value:new Kt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Vt}}]),vertexShader:Gt.meshphysical_vert,fragmentShader:Gt.meshphysical_frag};const Nr={r:0,b:0,g:0},gi=new Gn,W_=new fe;function X_(i,t,e,n,s,r,o){const a=new Zt(0);let l=r===!0?0:1,c,u,h=null,d=0,f=null;function g(y){let M=y.isScene===!0?y.background:null;return M&&M.isTexture&&(M=(y.backgroundBlurriness>0?e:t).get(M)),M}function _(y){let M=!1;const A=g(y);A===null?m(a,l):A&&A.isColor&&(m(A,1),M=!0);const U=i.xr.getEnvironmentBlendMode();U==="additive"?n.buffers.color.setClear(0,0,0,1,o):U==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||M)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function p(y,M){const A=g(M);A&&(A.isCubeTexture||A.mapping===Uo)?(u===void 0&&(u=new Ke(new li(1,1,1),new Sn({name:"BackgroundCubeMaterial",uniforms:xs(En.backgroundCube.uniforms),vertexShader:En.backgroundCube.vertexShader,fragmentShader:En.backgroundCube.fragmentShader,side:je,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(U,C,E){this.matrixWorld.copyPosition(E.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),gi.copy(M.backgroundRotation),gi.x*=-1,gi.y*=-1,gi.z*=-1,A.isCubeTexture&&A.isRenderTargetTexture===!1&&(gi.y*=-1,gi.z*=-1),u.material.uniforms.envMap.value=A,u.material.uniforms.flipEnvMap.value=A.isCubeTexture&&A.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(W_.makeRotationFromEuler(gi)),u.material.toneMapped=oe.getTransfer(A.colorSpace)!==de,(h!==A||d!==A.version||f!==i.toneMapping)&&(u.material.needsUpdate=!0,h=A,d=A.version,f=i.toneMapping),u.layers.enableAll(),y.unshift(u,u.geometry,u.material,0,0,null)):A&&A.isTexture&&(c===void 0&&(c=new Ke(new cr(2,2),new Sn({name:"BackgroundMaterial",uniforms:xs(En.background.uniforms),vertexShader:En.background.vertexShader,fragmentShader:En.background.fragmentShader,side:ri,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=A,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=oe.getTransfer(A.colorSpace)!==de,A.matrixAutoUpdate===!0&&A.updateMatrix(),c.material.uniforms.uvTransform.value.copy(A.matrix),(h!==A||d!==A.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,h=A,d=A.version,f=i.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null))}function m(y,M){y.getRGB(Nr,id(i)),n.buffers.color.setClear(Nr.r,Nr.g,Nr.b,M,o)}return{getClearColor:function(){return a},setClearColor:function(y,M=1){a.set(y),l=M,m(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(y){l=y,m(a,l)},render:_,addToRenderList:p}}function Y_(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null);let r=s,o=!1;function a(x,L,B,G,j){let Y=!1;const W=h(G,B,L);r!==W&&(r=W,c(r.object)),Y=f(x,G,B,j),Y&&g(x,G,B,j),j!==null&&t.update(j,i.ELEMENT_ARRAY_BUFFER),(Y||o)&&(o=!1,A(x,L,B,G),j!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(j).buffer))}function l(){return i.createVertexArray()}function c(x){return i.bindVertexArray(x)}function u(x){return i.deleteVertexArray(x)}function h(x,L,B){const G=B.wireframe===!0;let j=n[x.id];j===void 0&&(j={},n[x.id]=j);let Y=j[L.id];Y===void 0&&(Y={},j[L.id]=Y);let W=Y[G];return W===void 0&&(W=d(l()),Y[G]=W),W}function d(x){const L=[],B=[],G=[];for(let j=0;j<e;j++)L[j]=0,B[j]=0,G[j]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:B,attributeDivisors:G,object:x,attributes:{},index:null}}function f(x,L,B,G){const j=r.attributes,Y=L.attributes;let W=0;const $=B.getAttributes();for(const V in $)if($[V].location>=0){const ft=j[V];let Mt=Y[V];if(Mt===void 0&&(V==="instanceMatrix"&&x.instanceMatrix&&(Mt=x.instanceMatrix),V==="instanceColor"&&x.instanceColor&&(Mt=x.instanceColor)),ft===void 0||ft.attribute!==Mt||Mt&&ft.data!==Mt.data)return!0;W++}return r.attributesNum!==W||r.index!==G}function g(x,L,B,G){const j={},Y=L.attributes;let W=0;const $=B.getAttributes();for(const V in $)if($[V].location>=0){let ft=Y[V];ft===void 0&&(V==="instanceMatrix"&&x.instanceMatrix&&(ft=x.instanceMatrix),V==="instanceColor"&&x.instanceColor&&(ft=x.instanceColor));const Mt={};Mt.attribute=ft,ft&&ft.data&&(Mt.data=ft.data),j[V]=Mt,W++}r.attributes=j,r.attributesNum=W,r.index=G}function _(){const x=r.newAttributes;for(let L=0,B=x.length;L<B;L++)x[L]=0}function p(x){m(x,0)}function m(x,L){const B=r.newAttributes,G=r.enabledAttributes,j=r.attributeDivisors;B[x]=1,G[x]===0&&(i.enableVertexAttribArray(x),G[x]=1),j[x]!==L&&(i.vertexAttribDivisor(x,L),j[x]=L)}function y(){const x=r.newAttributes,L=r.enabledAttributes;for(let B=0,G=L.length;B<G;B++)L[B]!==x[B]&&(i.disableVertexAttribArray(B),L[B]=0)}function M(x,L,B,G,j,Y,W){W===!0?i.vertexAttribIPointer(x,L,B,j,Y):i.vertexAttribPointer(x,L,B,G,j,Y)}function A(x,L,B,G){_();const j=G.attributes,Y=B.getAttributes(),W=L.defaultAttributeValues;for(const $ in Y){const V=Y[$];if(V.location>=0){let ht=j[$];if(ht===void 0&&($==="instanceMatrix"&&x.instanceMatrix&&(ht=x.instanceMatrix),$==="instanceColor"&&x.instanceColor&&(ht=x.instanceColor)),ht!==void 0){const ft=ht.normalized,Mt=ht.itemSize,kt=t.get(ht);if(kt===void 0)continue;const ee=kt.buffer,X=kt.type,nt=kt.bytesPerElement,bt=X===i.INT||X===i.UNSIGNED_INT||ht.gpuType===$l;if(ht.isInterleavedBufferAttribute){const gt=ht.data,Rt=gt.stride,Ut=ht.offset;if(gt.isInstancedInterleavedBuffer){for(let Xt=0;Xt<V.locationSize;Xt++)m(V.location+Xt,gt.meshPerAttribute);x.isInstancedMesh!==!0&&G._maxInstanceCount===void 0&&(G._maxInstanceCount=gt.meshPerAttribute*gt.count)}else for(let Xt=0;Xt<V.locationSize;Xt++)p(V.location+Xt);i.bindBuffer(i.ARRAY_BUFFER,ee);for(let Xt=0;Xt<V.locationSize;Xt++)M(V.location+Xt,Mt/V.locationSize,X,ft,Rt*nt,(Ut+Mt/V.locationSize*Xt)*nt,bt)}else{if(ht.isInstancedBufferAttribute){for(let gt=0;gt<V.locationSize;gt++)m(V.location+gt,ht.meshPerAttribute);x.isInstancedMesh!==!0&&G._maxInstanceCount===void 0&&(G._maxInstanceCount=ht.meshPerAttribute*ht.count)}else for(let gt=0;gt<V.locationSize;gt++)p(V.location+gt);i.bindBuffer(i.ARRAY_BUFFER,ee);for(let gt=0;gt<V.locationSize;gt++)M(V.location+gt,Mt/V.locationSize,X,ft,Mt*nt,Mt/V.locationSize*gt*nt,bt)}}else if(W!==void 0){const ft=W[$];if(ft!==void 0)switch(ft.length){case 2:i.vertexAttrib2fv(V.location,ft);break;case 3:i.vertexAttrib3fv(V.location,ft);break;case 4:i.vertexAttrib4fv(V.location,ft);break;default:i.vertexAttrib1fv(V.location,ft)}}}}y()}function U(){P();for(const x in n){const L=n[x];for(const B in L){const G=L[B];for(const j in G)u(G[j].object),delete G[j];delete L[B]}delete n[x]}}function C(x){if(n[x.id]===void 0)return;const L=n[x.id];for(const B in L){const G=L[B];for(const j in G)u(G[j].object),delete G[j];delete L[B]}delete n[x.id]}function E(x){for(const L in n){const B=n[L];if(B[x.id]===void 0)continue;const G=B[x.id];for(const j in G)u(G[j].object),delete G[j];delete B[x.id]}}function P(){b(),o=!0,r!==s&&(r=s,c(r.object))}function b(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:P,resetDefaultState:b,dispose:U,releaseStatesOfGeometry:C,releaseStatesOfProgram:E,initAttributes:_,enableAttribute:p,disableUnusedAttributes:y}}function q_(i,t,e){let n;function s(c){n=c}function r(c,u){i.drawArrays(n,c,u),e.update(u,n,1)}function o(c,u,h){h!==0&&(i.drawArraysInstanced(n,c,u,h),e.update(u,n,h))}function a(c,u,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,u,0,h);let f=0;for(let g=0;g<h;g++)f+=u[g];e.update(f,n,1)}function l(c,u,h,d){if(h===0)return;const f=t.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],u[g],d[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,u,0,d,0,h);let g=0;for(let _=0;_<h;_++)g+=u[_];for(let _=0;_<d.length;_++)e.update(g,n,d[_])}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function $_(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const C=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(C){return!(C!==xn&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(C){const E=C===ar&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(C!==Hn&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==Tn&&!E)}function l(C){if(C==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const h=e.logarithmicDepthBuffer===!0,d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),f=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_TEXTURE_SIZE),_=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),m=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),y=i.getParameter(i.MAX_VARYING_VECTORS),M=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),A=f>0,U=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,maxTextures:d,maxVertexTextures:f,maxTextureSize:g,maxCubemapSize:_,maxAttributes:p,maxVertexUniforms:m,maxVaryings:y,maxFragmentUniforms:M,vertexTextures:A,maxSamples:U}}function K_(i){const t=this;let e=null,n=0,s=!1,r=!1;const o=new bi,a=new Vt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){const f=h.length!==0||d||n!==0||s;return s=d,n=h.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){e=u(h,d,0)},this.setState=function(h,d,f){const g=h.clippingPlanes,_=h.clipIntersection,p=h.clipShadows,m=i.get(h);if(!s||g===null||g.length===0||r&&!p)r?u(null):c();else{const y=r?0:n,M=y*4;let A=m.clippingState||null;l.value=A,A=u(g,d,M,f);for(let U=0;U!==M;++U)A[U]=e[U];m.clippingState=A,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(h,d,f,g){const _=h!==null?h.length:0;let p=null;if(_!==0){if(p=l.value,g!==!0||p===null){const m=f+_*4,y=d.matrixWorldInverse;a.getNormalMatrix(y),(p===null||p.length<m)&&(p=new Float32Array(m));for(let M=0,A=f;M!==_;++M,A+=4)o.copy(h[M]).applyMatrix4(y,a),o.normal.toArray(p,A),p[A+3]=o.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,p}}function j_(i){let t=new WeakMap;function e(o,a){return a===Qa?o.mapping=ms:a===tl&&(o.mapping=gs),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===Qa||a===tl)if(t.has(o)){const l=t.get(o).texture;return e(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new am(l.height);return c.fromEquirectangularTexture(i,o),t.set(o,c),o.addEventListener("dispose",s),e(c.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=t.get(a);l!==void 0&&(t.delete(a),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class Z_ extends sd{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-t,o=n+t,a=s+e,l=s-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const os=4,eu=[.125,.215,.35,.446,.526,.582],Ai=20,ga=new Z_,nu=new Zt;let _a=null,va=0,xa=0,Sa=!1;const yi=(1+Math.sqrt(5))/2,Zi=1/yi,iu=[new k(-yi,Zi,0),new k(yi,Zi,0),new k(-Zi,0,yi),new k(Zi,0,yi),new k(0,yi,-Zi),new k(0,yi,Zi),new k(-1,1,-1),new k(1,1,-1),new k(-1,1,1),new k(1,1,1)];class su{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){_a=this._renderer.getRenderTarget(),va=this._renderer.getActiveCubeFace(),xa=this._renderer.getActiveMipmapLevel(),Sa=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=au(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ou(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(_a,va,xa),this._renderer.xr.enabled=Sa,t.scissorTest=!1,Ur(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===ms||t.mapping===gs?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),_a=this._renderer.getRenderTarget(),va=this._renderer.getActiveCubeFace(),xa=this._renderer.getActiveMipmapLevel(),Sa=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:vn,minFilter:vn,generateMipmaps:!1,type:ar,format:xn,colorSpace:ai,depthBuffer:!1},s=ru(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ru(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=J_(r)),this._blurMaterial=Q_(r,t,e)}return s}_compileMaterial(t){const e=new Ke(this._lodPlanes[0],t);this._renderer.compile(e,ga)}_sceneToCubeUV(t,e,n,s){const a=new an(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,d=u.toneMapping;u.getClearColor(nu),u.toneMapping=ii,u.autoClear=!1;const f=new lr({name:"PMREM.Background",side:je,depthWrite:!1,depthTest:!1}),g=new Ke(new li,f);let _=!1;const p=t.background;p?p.isColor&&(f.color.copy(p),t.background=null,_=!0):(f.color.copy(nu),_=!0);for(let m=0;m<6;m++){const y=m%3;y===0?(a.up.set(0,l[m],0),a.lookAt(c[m],0,0)):y===1?(a.up.set(0,0,l[m]),a.lookAt(0,c[m],0)):(a.up.set(0,l[m],0),a.lookAt(0,0,c[m]));const M=this._cubeSize;Ur(s,y*M,m>2?M:0,M,M),u.setRenderTarget(s),_&&u.render(g,a),u.render(t,a)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=d,u.autoClear=h,t.background=p}_textureToCubeUV(t,e){const n=this._renderer,s=t.mapping===ms||t.mapping===gs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=au()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ou());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new Ke(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=t;const l=this._cubeSize;Ur(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,ga)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=iu[(s-r-1)%iu.length];this._blur(t,r-1,r,o,a)}e.autoClear=n}_blur(t,e,n,s,r){const o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,s,"latitudinal",r),this._halfBlur(o,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,h=new Ke(this._lodPlanes[s],c),d=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*Ai-1),_=r/g,p=isFinite(r)?1+Math.floor(u*_):Ai;p>Ai&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Ai}`);const m=[];let y=0;for(let E=0;E<Ai;++E){const P=E/_,b=Math.exp(-P*P/2);m.push(b),E===0?y+=b:E<p&&(y+=2*b)}for(let E=0;E<m.length;E++)m[E]=m[E]/y;d.envMap.value=t.texture,d.samples.value=p,d.weights.value=m,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:M}=this;d.dTheta.value=g,d.mipInt.value=M-n;const A=this._sizeLods[s],U=3*A*(s>M-os?s-M+os:0),C=4*(this._cubeSize-A);Ur(e,U,C,3*A,2*A),l.setRenderTarget(e),l.render(h,ga)}}function J_(i){const t=[],e=[],n=[];let s=i;const r=i-os+1+eu.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);e.push(a);let l=1/a;o>i-os?l=eu[o-i+os-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,g=6,_=3,p=2,m=1,y=new Float32Array(_*g*f),M=new Float32Array(p*g*f),A=new Float32Array(m*g*f);for(let C=0;C<f;C++){const E=C%3*2/3-1,P=C>2?0:-1,b=[E,P,0,E+2/3,P,0,E+2/3,P+1,0,E,P,0,E+2/3,P+1,0,E,P+1,0];y.set(b,_*g*C),M.set(d,p*g*C);const x=[C,C,C,C,C,C];A.set(x,m*g*C)}const U=new Mn;U.setAttribute("position",new Ae(y,_)),U.setAttribute("uv",new Ae(M,p)),U.setAttribute("faceIndex",new Ae(A,m)),t.push(U),s>os&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function ru(i,t,e){const n=new Ii(i,t,e);return n.texture.mapping=Uo,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ur(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Q_(i,t,e){const n=new Float32Array(Ai),s=new k(0,1,0);return new Sn({name:"SphericalGaussianBlur",defines:{n:Ai,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:nc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:ni,depthTest:!1,depthWrite:!1})}function ou(){return new Sn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:nc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:ni,depthTest:!1,depthWrite:!1})}function au(){return new Sn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:nc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ni,depthTest:!1,depthWrite:!1})}function nc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function t0(i){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===Qa||l===tl,u=l===ms||l===gs;if(c||u){let h=t.get(a);const d=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return e===null&&(e=new su(i)),h=c?e.fromEquirectangular(a,h):e.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,t.set(a,h),h.texture;if(h!==void 0)return h.texture;{const f=a.image;return c&&f&&f.height>0||u&&f&&s(f)?(e===null&&(e=new su(i)),h=c?e.fromEquirectangular(a):e.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,t.set(a,h),a.addEventListener("dispose",r),h.texture):null}}}return a}function s(a){let l=0;const c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function e0(i){const t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&hs("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function n0(i,t,e,n){const s={},r=new WeakMap;function o(h){const d=h.target;d.index!==null&&t.remove(d.index);for(const g in d.attributes)t.remove(d.attributes[g]);for(const g in d.morphAttributes){const _=d.morphAttributes[g];for(let p=0,m=_.length;p<m;p++)t.remove(_[p])}d.removeEventListener("dispose",o),delete s[d.id];const f=r.get(d);f&&(t.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(h,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,e.memory.geometries++),d}function l(h){const d=h.attributes;for(const g in d)t.update(d[g],i.ARRAY_BUFFER);const f=h.morphAttributes;for(const g in f){const _=f[g];for(let p=0,m=_.length;p<m;p++)t.update(_[p],i.ARRAY_BUFFER)}}function c(h){const d=[],f=h.index,g=h.attributes.position;let _=0;if(f!==null){const y=f.array;_=f.version;for(let M=0,A=y.length;M<A;M+=3){const U=y[M+0],C=y[M+1],E=y[M+2];d.push(U,C,C,E,E,U)}}else if(g!==void 0){const y=g.array;_=g.version;for(let M=0,A=y.length/3-1;M<A;M+=3){const U=M+0,C=M+1,E=M+2;d.push(U,C,C,E,E,U)}}else return;const p=new(Kh(d)?nd:ed)(d,1);p.version=_;const m=r.get(h);m&&t.remove(m),r.set(h,p)}function u(h){const d=r.get(h);if(d){const f=h.index;f!==null&&d.version<f.version&&c(h)}else c(h);return r.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function i0(i,t,e){let n;function s(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,f){i.drawElements(n,f,r,d*o),e.update(f,n,1)}function c(d,f,g){g!==0&&(i.drawElementsInstanced(n,f,r,d*o,g),e.update(f,n,g))}function u(d,f,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,g);let p=0;for(let m=0;m<g;m++)p+=f[m];e.update(p,n,1)}function h(d,f,g,_){if(g===0)return;const p=t.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<d.length;m++)c(d[m]/o,f[m],_[m]);else{p.multiDrawElementsInstancedWEBGL(n,f,0,r,d,0,_,0,g);let m=0;for(let y=0;y<g;y++)m+=f[y];for(let y=0;y<_.length;y++)e.update(m,n,_[y])}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function s0(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function r0(i,t,e){const n=new WeakMap,s=new Le;function r(o,a,l){const c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0;let d=n.get(a);if(d===void 0||d.count!==h){let x=function(){P.dispose(),n.delete(a),a.removeEventListener("dispose",x)};var f=x;d!==void 0&&d.texture.dispose();const g=a.morphAttributes.position!==void 0,_=a.morphAttributes.normal!==void 0,p=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],y=a.morphAttributes.normal||[],M=a.morphAttributes.color||[];let A=0;g===!0&&(A=1),_===!0&&(A=2),p===!0&&(A=3);let U=a.attributes.position.count*A,C=1;U>t.maxTextureSize&&(C=Math.ceil(U/t.maxTextureSize),U=t.maxTextureSize);const E=new Float32Array(U*C*4*h),P=new Zh(E,U,C,h);P.type=Tn,P.needsUpdate=!0;const b=A*4;for(let L=0;L<h;L++){const B=m[L],G=y[L],j=M[L],Y=U*C*4*L;for(let W=0;W<B.count;W++){const $=W*b;g===!0&&(s.fromBufferAttribute(B,W),E[Y+$+0]=s.x,E[Y+$+1]=s.y,E[Y+$+2]=s.z,E[Y+$+3]=0),_===!0&&(s.fromBufferAttribute(G,W),E[Y+$+4]=s.x,E[Y+$+5]=s.y,E[Y+$+6]=s.z,E[Y+$+7]=0),p===!0&&(s.fromBufferAttribute(j,W),E[Y+$+8]=s.x,E[Y+$+9]=s.y,E[Y+$+10]=s.z,E[Y+$+11]=j.itemSize===4?s.w:1)}}d={count:h,texture:P,size:new Kt(U,C)},n.set(a,d),a.addEventListener("dispose",x)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let g=0;for(let p=0;p<c.length;p++)g+=c[p];const _=a.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function o0(i,t,e,n){let s=new WeakMap;function r(l){const c=n.render.frame,u=l.geometry,h=t.get(l,u);if(s.get(h)!==c&&(t.update(h),s.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return h}function o(){s=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:o}}class ld extends Be{constructor(t,e,n,s,r,o,a,l,c,u=us){if(u!==us&&u!==vs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===us&&(n=Pi),n===void 0&&u===vs&&(n=_s),super(null,s,r,o,a,l,u,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:we,this.minFilter=l!==void 0?l:we,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const cd=new Be,lu=new ld(1,1),ud=new Zh,hd=new Xp,dd=new rd,cu=[],uu=[],hu=new Float32Array(16),du=new Float32Array(9),fu=new Float32Array(4);function Ts(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let r=cu[s];if(r===void 0&&(r=new Float32Array(s),cu[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function Te(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Re(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function ko(i,t){let e=uu[t];e===void 0&&(e=new Int32Array(t),uu[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function a0(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function l0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;i.uniform2fv(this.addr,t),Re(e,t)}}function c0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Te(e,t))return;i.uniform3fv(this.addr,t),Re(e,t)}}function u0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;i.uniform4fv(this.addr,t),Re(e,t)}}function h0(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Te(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Re(e,t)}else{if(Te(e,n))return;fu.set(n),i.uniformMatrix2fv(this.addr,!1,fu),Re(e,n)}}function d0(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Te(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Re(e,t)}else{if(Te(e,n))return;du.set(n),i.uniformMatrix3fv(this.addr,!1,du),Re(e,n)}}function f0(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Te(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Re(e,t)}else{if(Te(e,n))return;hu.set(n),i.uniformMatrix4fv(this.addr,!1,hu),Re(e,n)}}function p0(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function m0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;i.uniform2iv(this.addr,t),Re(e,t)}}function g0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Te(e,t))return;i.uniform3iv(this.addr,t),Re(e,t)}}function _0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;i.uniform4iv(this.addr,t),Re(e,t)}}function v0(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function x0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;i.uniform2uiv(this.addr,t),Re(e,t)}}function S0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Te(e,t))return;i.uniform3uiv(this.addr,t),Re(e,t)}}function M0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;i.uniform4uiv(this.addr,t),Re(e,t)}}function b0(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(lu.compareFunction=$h,r=lu):r=cd,e.setTexture2D(t||r,s)}function y0(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||hd,s)}function E0(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||dd,s)}function w0(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||ud,s)}function A0(i){switch(i){case 5126:return a0;case 35664:return l0;case 35665:return c0;case 35666:return u0;case 35674:return h0;case 35675:return d0;case 35676:return f0;case 5124:case 35670:return p0;case 35667:case 35671:return m0;case 35668:case 35672:return g0;case 35669:case 35673:return _0;case 5125:return v0;case 36294:return x0;case 36295:return S0;case 36296:return M0;case 35678:case 36198:case 36298:case 36306:case 35682:return b0;case 35679:case 36299:case 36307:return y0;case 35680:case 36300:case 36308:case 36293:return E0;case 36289:case 36303:case 36311:case 36292:return w0}}function T0(i,t){i.uniform1fv(this.addr,t)}function R0(i,t){const e=Ts(t,this.size,2);i.uniform2fv(this.addr,e)}function C0(i,t){const e=Ts(t,this.size,3);i.uniform3fv(this.addr,e)}function L0(i,t){const e=Ts(t,this.size,4);i.uniform4fv(this.addr,e)}function P0(i,t){const e=Ts(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function I0(i,t){const e=Ts(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function D0(i,t){const e=Ts(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function N0(i,t){i.uniform1iv(this.addr,t)}function U0(i,t){i.uniform2iv(this.addr,t)}function O0(i,t){i.uniform3iv(this.addr,t)}function k0(i,t){i.uniform4iv(this.addr,t)}function F0(i,t){i.uniform1uiv(this.addr,t)}function B0(i,t){i.uniform2uiv(this.addr,t)}function z0(i,t){i.uniform3uiv(this.addr,t)}function H0(i,t){i.uniform4uiv(this.addr,t)}function G0(i,t,e){const n=this.cache,s=t.length,r=ko(e,s);Te(n,r)||(i.uniform1iv(this.addr,r),Re(n,r));for(let o=0;o!==s;++o)e.setTexture2D(t[o]||cd,r[o])}function V0(i,t,e){const n=this.cache,s=t.length,r=ko(e,s);Te(n,r)||(i.uniform1iv(this.addr,r),Re(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||hd,r[o])}function W0(i,t,e){const n=this.cache,s=t.length,r=ko(e,s);Te(n,r)||(i.uniform1iv(this.addr,r),Re(n,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||dd,r[o])}function X0(i,t,e){const n=this.cache,s=t.length,r=ko(e,s);Te(n,r)||(i.uniform1iv(this.addr,r),Re(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||ud,r[o])}function Y0(i){switch(i){case 5126:return T0;case 35664:return R0;case 35665:return C0;case 35666:return L0;case 35674:return P0;case 35675:return I0;case 35676:return D0;case 5124:case 35670:return N0;case 35667:case 35671:return U0;case 35668:case 35672:return O0;case 35669:case 35673:return k0;case 5125:return F0;case 36294:return B0;case 36295:return z0;case 36296:return H0;case 35678:case 36198:case 36298:case 36306:case 35682:return G0;case 35679:case 36299:case 36307:return V0;case 35680:case 36300:case 36308:case 36293:return W0;case 36289:case 36303:case 36311:case 36292:return X0}}class q0{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=A0(e.type)}}class $0{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Y0(e.type)}}class K0{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(t,e[a.id],n)}}}const Ma=/(\w+)(\])?(\[|\.)?/g;function pu(i,t){i.seq.push(t),i.map[t.id]=t}function j0(i,t,e){const n=i.name,s=n.length;for(Ma.lastIndex=0;;){const r=Ma.exec(n),o=Ma.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){pu(e,c===void 0?new q0(a,i,t):new $0(a,i,t));break}else{let h=e.map[a];h===void 0&&(h=new K0(a),pu(e,h)),e=h}}}class ao{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=t.getActiveUniform(e,s),o=t.getUniformLocation(e,r.name);j0(r,o,this)}}setValue(t,e,n,s){const r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){const a=e[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,r=t.length;s!==r;++s){const o=t[s];o.id in e&&n.push(o)}return n}}function mu(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const Z0=37297;let J0=0;function Q0(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}function tv(i){const t=oe.getPrimaries(oe.workingColorSpace),e=oe.getPrimaries(i);let n;switch(t===e?n="":t===po&&e===fo?n="LinearDisplayP3ToLinearSRGB":t===fo&&e===po&&(n="LinearSRGBToLinearDisplayP3"),i){case ai:case Oo:return[n,"LinearTransferOETF"];case on:case ec:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function gu(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const o=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+Q0(i.getShaderSource(t),o)}else return s}function ev(i,t){const e=tv(t);return`vec4 ${i}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function nv(i,t){let e;switch(t){case _p:e="Linear";break;case vp:e="Reinhard";break;case xp:e="Cineon";break;case Sp:e="ACESFilmic";break;case bp:e="AgX";break;case yp:e="Neutral";break;case Mp:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const Or=new k;function iv(){oe.getLuminanceCoefficients(Or);const i=Or.x.toFixed(4),t=Or.y.toFixed(4),e=Or.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function sv(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter($s).join(`
`)}function rv(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function ov(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(t,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function $s(i){return i!==""}function _u(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function vu(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const av=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ll(i){return i.replace(av,cv)}const lv=new Map;function cv(i,t){let e=Gt[t];if(e===void 0){const n=lv.get(t);if(n!==void 0)e=Gt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return Ll(e)}const uv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function xu(i){return i.replace(uv,hv)}function hv(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Su(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function dv(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Oh?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===Vf?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===kn&&(t="SHADOWMAP_TYPE_VSM"),t}function fv(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case ms:case gs:t="ENVMAP_TYPE_CUBE";break;case Uo:t="ENVMAP_TYPE_CUBE_UV";break}return t}function pv(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case gs:t="ENVMAP_MODE_REFRACTION";break}return t}function mv(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case kh:t="ENVMAP_BLENDING_MULTIPLY";break;case mp:t="ENVMAP_BLENDING_MIX";break;case gp:t="ENVMAP_BLENDING_ADD";break}return t}function gv(i){const t=i.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function _v(i,t,e,n){const s=i.getContext(),r=e.defines;let o=e.vertexShader,a=e.fragmentShader;const l=dv(e),c=fv(e),u=pv(e),h=mv(e),d=gv(e),f=sv(e),g=rv(r),_=s.createProgram();let p,m,y=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter($s).join(`
`),p.length>0&&(p+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter($s).join(`
`),m.length>0&&(m+=`
`)):(p=[Su(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter($s).join(`
`),m=[Su(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+u:"",e.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==ii?"#define TONE_MAPPING":"",e.toneMapping!==ii?Gt.tonemapping_pars_fragment:"",e.toneMapping!==ii?nv("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Gt.colorspace_pars_fragment,ev("linearToOutputTexel",e.outputColorSpace),iv(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter($s).join(`
`)),o=Ll(o),o=_u(o,e),o=vu(o,e),a=Ll(a),a=_u(a,e),a=vu(a,e),o=xu(o),a=xu(a),e.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,p=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,m=["#define varying in",e.glslVersion===Uc?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Uc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const M=y+p+o,A=y+m+a,U=mu(s,s.VERTEX_SHADER,M),C=mu(s,s.FRAGMENT_SHADER,A);s.attachShader(_,U),s.attachShader(_,C),e.index0AttributeName!==void 0?s.bindAttribLocation(_,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function E(L){if(i.debug.checkShaderErrors){const B=s.getProgramInfoLog(_).trim(),G=s.getShaderInfoLog(U).trim(),j=s.getShaderInfoLog(C).trim();let Y=!0,W=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(Y=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,U,C);else{const $=gu(s,U,"vertex"),V=gu(s,C,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+B+`
`+$+`
`+V)}else B!==""?console.warn("THREE.WebGLProgram: Program Info Log:",B):(G===""||j==="")&&(W=!1);W&&(L.diagnostics={runnable:Y,programLog:B,vertexShader:{log:G,prefix:p},fragmentShader:{log:j,prefix:m}})}s.deleteShader(U),s.deleteShader(C),P=new ao(s,_),b=ov(s,_)}let P;this.getUniforms=function(){return P===void 0&&E(this),P};let b;this.getAttributes=function(){return b===void 0&&E(this),b};let x=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return x===!1&&(x=s.getProgramParameter(_,Z0)),x},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=J0++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=U,this.fragmentShader=C,this}let vv=0;class xv{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new Sv(t),e.set(t,n)),n}}class Sv{constructor(t){this.id=vv++,this.code=t,this.usedTimes=0}}function Mv(i,t,e,n,s,r,o){const a=new Qh,l=new xv,c=new Set,u=[],h=s.logarithmicDepthBuffer,d=s.vertexTextures;let f=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(b){return c.add(b),b===0?"uv":`uv${b}`}function p(b,x,L,B,G){const j=B.fog,Y=G.geometry,W=b.isMeshStandardMaterial?B.environment:null,$=(b.isMeshStandardMaterial?e:t).get(b.envMap||W),V=$&&$.mapping===Uo?$.image.height:null,ht=g[b.type];b.precision!==null&&(f=s.getMaxPrecision(b.precision),f!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",f,"instead."));const ft=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,Mt=ft!==void 0?ft.length:0;let kt=0;Y.morphAttributes.position!==void 0&&(kt=1),Y.morphAttributes.normal!==void 0&&(kt=2),Y.morphAttributes.color!==void 0&&(kt=3);let ee,X,nt,bt;if(ht){const ne=En[ht];ee=ne.vertexShader,X=ne.fragmentShader}else ee=b.vertexShader,X=b.fragmentShader,l.update(b),nt=l.getVertexShaderID(b),bt=l.getFragmentShaderID(b);const gt=i.getRenderTarget(),Rt=G.isInstancedMesh===!0,Ut=G.isBatchedMesh===!0,Xt=!!b.map,pe=!!b.matcap,w=!!$,zt=!!b.aoMap,Ft=!!b.lightMap,$t=!!b.bumpMap,wt=!!b.normalMap,me=!!b.displacementMap,Lt=!!b.emissiveMap,Dt=!!b.metalnessMap,R=!!b.roughnessMap,v=b.anisotropy>0,H=b.clearcoat>0,J=b.dispersion>0,tt=b.iridescence>0,Q=b.sheen>0,Ct=b.transmission>0,dt=v&&!!b.anisotropyMap,xt=H&&!!b.clearcoatMap,Ht=H&&!!b.clearcoatNormalMap,rt=H&&!!b.clearcoatRoughnessMap,vt=tt&&!!b.iridescenceMap,Jt=tt&&!!b.iridescenceThicknessMap,Ot=Q&&!!b.sheenColorMap,St=Q&&!!b.sheenRoughnessMap,Bt=!!b.specularMap,Yt=!!b.specularColorMap,ge=!!b.specularIntensityMap,I=Ct&&!!b.transmissionMap,ot=Ct&&!!b.thicknessMap,q=!!b.gradientMap,Z=!!b.alphaMap,ct=b.alphaTest>0,Pt=!!b.alphaHash,Qt=!!b.extensions;let Me=ii;b.toneMapped&&(gt===null||gt.isXRRenderTarget===!0)&&(Me=i.toneMapping);const De={shaderID:ht,shaderType:b.type,shaderName:b.name,vertexShader:ee,fragmentShader:X,defines:b.defines,customVertexShaderID:nt,customFragmentShaderID:bt,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:f,batching:Ut,batchingColor:Ut&&G._colorsTexture!==null,instancing:Rt,instancingColor:Rt&&G.instanceColor!==null,instancingMorph:Rt&&G.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:gt===null?i.outputColorSpace:gt.isXRRenderTarget===!0?gt.texture.colorSpace:ai,alphaToCoverage:!!b.alphaToCoverage,map:Xt,matcap:pe,envMap:w,envMapMode:w&&$.mapping,envMapCubeUVHeight:V,aoMap:zt,lightMap:Ft,bumpMap:$t,normalMap:wt,displacementMap:d&&me,emissiveMap:Lt,normalMapObjectSpace:wt&&b.normalMapType===Rp,normalMapTangentSpace:wt&&b.normalMapType===Tp,metalnessMap:Dt,roughnessMap:R,anisotropy:v,anisotropyMap:dt,clearcoat:H,clearcoatMap:xt,clearcoatNormalMap:Ht,clearcoatRoughnessMap:rt,dispersion:J,iridescence:tt,iridescenceMap:vt,iridescenceThicknessMap:Jt,sheen:Q,sheenColorMap:Ot,sheenRoughnessMap:St,specularMap:Bt,specularColorMap:Yt,specularIntensityMap:ge,transmission:Ct,transmissionMap:I,thicknessMap:ot,gradientMap:q,opaque:b.transparent===!1&&b.blending===cs&&b.alphaToCoverage===!1,alphaMap:Z,alphaTest:ct,alphaHash:Pt,combine:b.combine,mapUv:Xt&&_(b.map.channel),aoMapUv:zt&&_(b.aoMap.channel),lightMapUv:Ft&&_(b.lightMap.channel),bumpMapUv:$t&&_(b.bumpMap.channel),normalMapUv:wt&&_(b.normalMap.channel),displacementMapUv:me&&_(b.displacementMap.channel),emissiveMapUv:Lt&&_(b.emissiveMap.channel),metalnessMapUv:Dt&&_(b.metalnessMap.channel),roughnessMapUv:R&&_(b.roughnessMap.channel),anisotropyMapUv:dt&&_(b.anisotropyMap.channel),clearcoatMapUv:xt&&_(b.clearcoatMap.channel),clearcoatNormalMapUv:Ht&&_(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:rt&&_(b.clearcoatRoughnessMap.channel),iridescenceMapUv:vt&&_(b.iridescenceMap.channel),iridescenceThicknessMapUv:Jt&&_(b.iridescenceThicknessMap.channel),sheenColorMapUv:Ot&&_(b.sheenColorMap.channel),sheenRoughnessMapUv:St&&_(b.sheenRoughnessMap.channel),specularMapUv:Bt&&_(b.specularMap.channel),specularColorMapUv:Yt&&_(b.specularColorMap.channel),specularIntensityMapUv:ge&&_(b.specularIntensityMap.channel),transmissionMapUv:I&&_(b.transmissionMap.channel),thicknessMapUv:ot&&_(b.thicknessMap.channel),alphaMapUv:Z&&_(b.alphaMap.channel),vertexTangents:!!Y.attributes.tangent&&(wt||v),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,pointsUvs:G.isPoints===!0&&!!Y.attributes.uv&&(Xt||Z),fog:!!j,useFog:b.fog===!0,fogExp2:!!j&&j.isFogExp2,flatShading:b.flatShading===!0,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:h,skinning:G.isSkinnedMesh===!0,morphTargets:Y.morphAttributes.position!==void 0,morphNormals:Y.morphAttributes.normal!==void 0,morphColors:Y.morphAttributes.color!==void 0,morphTargetsCount:Mt,morphTextureStride:kt,numDirLights:x.directional.length,numPointLights:x.point.length,numSpotLights:x.spot.length,numSpotLightMaps:x.spotLightMap.length,numRectAreaLights:x.rectArea.length,numHemiLights:x.hemi.length,numDirLightShadows:x.directionalShadowMap.length,numPointLightShadows:x.pointShadowMap.length,numSpotLightShadows:x.spotShadowMap.length,numSpotLightShadowsWithMaps:x.numSpotLightShadowsWithMaps,numLightProbes:x.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:b.dithering,shadowMapEnabled:i.shadowMap.enabled&&L.length>0,shadowMapType:i.shadowMap.type,toneMapping:Me,decodeVideoTexture:Xt&&b.map.isVideoTexture===!0&&oe.getTransfer(b.map.colorSpace)===de,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===_n,flipSided:b.side===je,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:Qt&&b.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Qt&&b.extensions.multiDraw===!0||Ut)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return De.vertexUv1s=c.has(1),De.vertexUv2s=c.has(2),De.vertexUv3s=c.has(3),c.clear(),De}function m(b){const x=[];if(b.shaderID?x.push(b.shaderID):(x.push(b.customVertexShaderID),x.push(b.customFragmentShaderID)),b.defines!==void 0)for(const L in b.defines)x.push(L),x.push(b.defines[L]);return b.isRawShaderMaterial===!1&&(y(x,b),M(x,b),x.push(i.outputColorSpace)),x.push(b.customProgramCacheKey),x.join()}function y(b,x){b.push(x.precision),b.push(x.outputColorSpace),b.push(x.envMapMode),b.push(x.envMapCubeUVHeight),b.push(x.mapUv),b.push(x.alphaMapUv),b.push(x.lightMapUv),b.push(x.aoMapUv),b.push(x.bumpMapUv),b.push(x.normalMapUv),b.push(x.displacementMapUv),b.push(x.emissiveMapUv),b.push(x.metalnessMapUv),b.push(x.roughnessMapUv),b.push(x.anisotropyMapUv),b.push(x.clearcoatMapUv),b.push(x.clearcoatNormalMapUv),b.push(x.clearcoatRoughnessMapUv),b.push(x.iridescenceMapUv),b.push(x.iridescenceThicknessMapUv),b.push(x.sheenColorMapUv),b.push(x.sheenRoughnessMapUv),b.push(x.specularMapUv),b.push(x.specularColorMapUv),b.push(x.specularIntensityMapUv),b.push(x.transmissionMapUv),b.push(x.thicknessMapUv),b.push(x.combine),b.push(x.fogExp2),b.push(x.sizeAttenuation),b.push(x.morphTargetsCount),b.push(x.morphAttributeCount),b.push(x.numDirLights),b.push(x.numPointLights),b.push(x.numSpotLights),b.push(x.numSpotLightMaps),b.push(x.numHemiLights),b.push(x.numRectAreaLights),b.push(x.numDirLightShadows),b.push(x.numPointLightShadows),b.push(x.numSpotLightShadows),b.push(x.numSpotLightShadowsWithMaps),b.push(x.numLightProbes),b.push(x.shadowMapType),b.push(x.toneMapping),b.push(x.numClippingPlanes),b.push(x.numClipIntersection),b.push(x.depthPacking)}function M(b,x){a.disableAll(),x.supportsVertexTextures&&a.enable(0),x.instancing&&a.enable(1),x.instancingColor&&a.enable(2),x.instancingMorph&&a.enable(3),x.matcap&&a.enable(4),x.envMap&&a.enable(5),x.normalMapObjectSpace&&a.enable(6),x.normalMapTangentSpace&&a.enable(7),x.clearcoat&&a.enable(8),x.iridescence&&a.enable(9),x.alphaTest&&a.enable(10),x.vertexColors&&a.enable(11),x.vertexAlphas&&a.enable(12),x.vertexUv1s&&a.enable(13),x.vertexUv2s&&a.enable(14),x.vertexUv3s&&a.enable(15),x.vertexTangents&&a.enable(16),x.anisotropy&&a.enable(17),x.alphaHash&&a.enable(18),x.batching&&a.enable(19),x.dispersion&&a.enable(20),x.batchingColor&&a.enable(21),b.push(a.mask),a.disableAll(),x.fog&&a.enable(0),x.useFog&&a.enable(1),x.flatShading&&a.enable(2),x.logarithmicDepthBuffer&&a.enable(3),x.skinning&&a.enable(4),x.morphTargets&&a.enable(5),x.morphNormals&&a.enable(6),x.morphColors&&a.enable(7),x.premultipliedAlpha&&a.enable(8),x.shadowMapEnabled&&a.enable(9),x.doubleSided&&a.enable(10),x.flipSided&&a.enable(11),x.useDepthPacking&&a.enable(12),x.dithering&&a.enable(13),x.transmission&&a.enable(14),x.sheen&&a.enable(15),x.opaque&&a.enable(16),x.pointsUvs&&a.enable(17),x.decodeVideoTexture&&a.enable(18),x.alphaToCoverage&&a.enable(19),b.push(a.mask)}function A(b){const x=g[b.type];let L;if(x){const B=En[x];L=im.clone(B.uniforms)}else L=b.uniforms;return L}function U(b,x){let L;for(let B=0,G=u.length;B<G;B++){const j=u[B];if(j.cacheKey===x){L=j,++L.usedTimes;break}}return L===void 0&&(L=new _v(i,x,b,r),u.push(L)),L}function C(b){if(--b.usedTimes===0){const x=u.indexOf(b);u[x]=u[u.length-1],u.pop(),b.destroy()}}function E(b){l.remove(b)}function P(){l.dispose()}return{getParameters:p,getProgramCacheKey:m,getUniforms:A,acquireProgram:U,releaseProgram:C,releaseShaderCache:E,programs:u,dispose:P}}function bv(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function yv(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function Mu(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function bu(){const i=[];let t=0;const e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(h,d,f,g,_,p){let m=i[t];return m===void 0?(m={id:h.id,object:h,geometry:d,material:f,groupOrder:g,renderOrder:h.renderOrder,z:_,group:p},i[t]=m):(m.id=h.id,m.object=h,m.geometry=d,m.material=f,m.groupOrder=g,m.renderOrder=h.renderOrder,m.z=_,m.group=p),t++,m}function a(h,d,f,g,_,p){const m=o(h,d,f,g,_,p);f.transmission>0?n.push(m):f.transparent===!0?s.push(m):e.push(m)}function l(h,d,f,g,_,p){const m=o(h,d,f,g,_,p);f.transmission>0?n.unshift(m):f.transparent===!0?s.unshift(m):e.unshift(m)}function c(h,d){e.length>1&&e.sort(h||yv),n.length>1&&n.sort(d||Mu),s.length>1&&s.sort(d||Mu)}function u(){for(let h=t,d=i.length;h<d;h++){const f=i[h];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:u,sort:c}}function Ev(){let i=new WeakMap;function t(n,s){const r=i.get(n);let o;return r===void 0?(o=new bu,i.set(n,[o])):s>=r.length?(o=new bu,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function wv(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new k,color:new Zt};break;case"SpotLight":e={position:new k,direction:new k,color:new Zt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new k,color:new Zt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new k,skyColor:new Zt,groundColor:new Zt};break;case"RectAreaLight":e={color:new Zt,position:new k,halfWidth:new k,halfHeight:new k};break}return i[t.id]=e,e}}}function Av(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Kt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Kt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Kt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let Tv=0;function Rv(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function Cv(i){const t=new wv,e=Av(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new k);const s=new k,r=new fe,o=new fe;function a(c){let u=0,h=0,d=0;for(let b=0;b<9;b++)n.probe[b].set(0,0,0);let f=0,g=0,_=0,p=0,m=0,y=0,M=0,A=0,U=0,C=0,E=0;c.sort(Rv);for(let b=0,x=c.length;b<x;b++){const L=c[b],B=L.color,G=L.intensity,j=L.distance,Y=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)u+=B.r*G,h+=B.g*G,d+=B.b*G;else if(L.isLightProbe){for(let W=0;W<9;W++)n.probe[W].addScaledVector(L.sh.coefficients[W],G);E++}else if(L.isDirectionalLight){const W=t.get(L);if(W.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const $=L.shadow,V=e.get(L);V.shadowIntensity=$.intensity,V.shadowBias=$.bias,V.shadowNormalBias=$.normalBias,V.shadowRadius=$.radius,V.shadowMapSize=$.mapSize,n.directionalShadow[f]=V,n.directionalShadowMap[f]=Y,n.directionalShadowMatrix[f]=L.shadow.matrix,y++}n.directional[f]=W,f++}else if(L.isSpotLight){const W=t.get(L);W.position.setFromMatrixPosition(L.matrixWorld),W.color.copy(B).multiplyScalar(G),W.distance=j,W.coneCos=Math.cos(L.angle),W.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),W.decay=L.decay,n.spot[_]=W;const $=L.shadow;if(L.map&&(n.spotLightMap[U]=L.map,U++,$.updateMatrices(L),L.castShadow&&C++),n.spotLightMatrix[_]=$.matrix,L.castShadow){const V=e.get(L);V.shadowIntensity=$.intensity,V.shadowBias=$.bias,V.shadowNormalBias=$.normalBias,V.shadowRadius=$.radius,V.shadowMapSize=$.mapSize,n.spotShadow[_]=V,n.spotShadowMap[_]=Y,A++}_++}else if(L.isRectAreaLight){const W=t.get(L);W.color.copy(B).multiplyScalar(G),W.halfWidth.set(L.width*.5,0,0),W.halfHeight.set(0,L.height*.5,0),n.rectArea[p]=W,p++}else if(L.isPointLight){const W=t.get(L);if(W.color.copy(L.color).multiplyScalar(L.intensity),W.distance=L.distance,W.decay=L.decay,L.castShadow){const $=L.shadow,V=e.get(L);V.shadowIntensity=$.intensity,V.shadowBias=$.bias,V.shadowNormalBias=$.normalBias,V.shadowRadius=$.radius,V.shadowMapSize=$.mapSize,V.shadowCameraNear=$.camera.near,V.shadowCameraFar=$.camera.far,n.pointShadow[g]=V,n.pointShadowMap[g]=Y,n.pointShadowMatrix[g]=L.shadow.matrix,M++}n.point[g]=W,g++}else if(L.isHemisphereLight){const W=t.get(L);W.skyColor.copy(L.color).multiplyScalar(G),W.groundColor.copy(L.groundColor).multiplyScalar(G),n.hemi[m]=W,m++}}p>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ut.LTC_FLOAT_1,n.rectAreaLTC2=ut.LTC_FLOAT_2):(n.rectAreaLTC1=ut.LTC_HALF_1,n.rectAreaLTC2=ut.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=d;const P=n.hash;(P.directionalLength!==f||P.pointLength!==g||P.spotLength!==_||P.rectAreaLength!==p||P.hemiLength!==m||P.numDirectionalShadows!==y||P.numPointShadows!==M||P.numSpotShadows!==A||P.numSpotMaps!==U||P.numLightProbes!==E)&&(n.directional.length=f,n.spot.length=_,n.rectArea.length=p,n.point.length=g,n.hemi.length=m,n.directionalShadow.length=y,n.directionalShadowMap.length=y,n.pointShadow.length=M,n.pointShadowMap.length=M,n.spotShadow.length=A,n.spotShadowMap.length=A,n.directionalShadowMatrix.length=y,n.pointShadowMatrix.length=M,n.spotLightMatrix.length=A+U-C,n.spotLightMap.length=U,n.numSpotLightShadowsWithMaps=C,n.numLightProbes=E,P.directionalLength=f,P.pointLength=g,P.spotLength=_,P.rectAreaLength=p,P.hemiLength=m,P.numDirectionalShadows=y,P.numPointShadows=M,P.numSpotShadows=A,P.numSpotMaps=U,P.numLightProbes=E,n.version=Tv++)}function l(c,u){let h=0,d=0,f=0,g=0,_=0;const p=u.matrixWorldInverse;for(let m=0,y=c.length;m<y;m++){const M=c[m];if(M.isDirectionalLight){const A=n.directional[h];A.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),A.direction.sub(s),A.direction.transformDirection(p),h++}else if(M.isSpotLight){const A=n.spot[f];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(p),A.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),A.direction.sub(s),A.direction.transformDirection(p),f++}else if(M.isRectAreaLight){const A=n.rectArea[g];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(p),o.identity(),r.copy(M.matrixWorld),r.premultiply(p),o.extractRotation(r),A.halfWidth.set(M.width*.5,0,0),A.halfHeight.set(0,M.height*.5,0),A.halfWidth.applyMatrix4(o),A.halfHeight.applyMatrix4(o),g++}else if(M.isPointLight){const A=n.point[d];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(p),d++}else if(M.isHemisphereLight){const A=n.hemi[_];A.direction.setFromMatrixPosition(M.matrixWorld),A.direction.transformDirection(p),_++}}}return{setup:a,setupView:l,state:n}}function yu(i){const t=new Cv(i),e=[],n=[];function s(u){c.camera=u,e.length=0,n.length=0}function r(u){e.push(u)}function o(u){n.push(u)}function a(){t.setup(e)}function l(u){t.setupView(e,u)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function Lv(i){let t=new WeakMap;function e(s,r=0){const o=t.get(s);let a;return o===void 0?(a=new yu(i),t.set(s,[a])):r>=o.length?(a=new yu(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}class Pv extends As{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=wp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class Iv extends As{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const Dv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Nv=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Uv(i,t,e){let n=new od;const s=new Kt,r=new Kt,o=new Le,a=new Pv({depthPacking:Ap}),l=new Iv,c={},u=e.maxTextureSize,h={[ri]:je,[je]:ri,[_n]:_n},d=new Sn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Kt},radius:{value:4}},vertexShader:Dv,fragmentShader:Nv}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const g=new Mn;g.setAttribute("position",new Ae(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new Ke(g,d),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Oh;let m=this.type;this.render=function(C,E,P){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||C.length===0)return;const b=i.getRenderTarget(),x=i.getActiveCubeFace(),L=i.getActiveMipmapLevel(),B=i.state;B.setBlending(ni),B.buffers.color.setClear(1,1,1,1),B.buffers.depth.setTest(!0),B.setScissorTest(!1);const G=m!==kn&&this.type===kn,j=m===kn&&this.type!==kn;for(let Y=0,W=C.length;Y<W;Y++){const $=C[Y],V=$.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",$,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);const ht=V.getFrameExtents();if(s.multiply(ht),r.copy(V.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/ht.x),s.x=r.x*ht.x,V.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/ht.y),s.y=r.y*ht.y,V.mapSize.y=r.y)),V.map===null||G===!0||j===!0){const Mt=this.type!==kn?{minFilter:we,magFilter:we}:{};V.map!==null&&V.map.dispose(),V.map=new Ii(s.x,s.y,Mt),V.map.texture.name=$.name+".shadowMap",V.camera.updateProjectionMatrix()}i.setRenderTarget(V.map),i.clear();const ft=V.getViewportCount();for(let Mt=0;Mt<ft;Mt++){const kt=V.getViewport(Mt);o.set(r.x*kt.x,r.y*kt.y,r.x*kt.z,r.y*kt.w),B.viewport(o),V.updateMatrices($,Mt),n=V.getFrustum(),A(E,P,V.camera,$,this.type)}V.isPointLightShadow!==!0&&this.type===kn&&y(V,P),V.needsUpdate=!1}m=this.type,p.needsUpdate=!1,i.setRenderTarget(b,x,L)};function y(C,E){const P=t.update(_);d.defines.VSM_SAMPLES!==C.blurSamples&&(d.defines.VSM_SAMPLES=C.blurSamples,f.defines.VSM_SAMPLES=C.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new Ii(s.x,s.y)),d.uniforms.shadow_pass.value=C.map.texture,d.uniforms.resolution.value=C.mapSize,d.uniforms.radius.value=C.radius,i.setRenderTarget(C.mapPass),i.clear(),i.renderBufferDirect(E,null,P,d,_,null),f.uniforms.shadow_pass.value=C.mapPass.texture,f.uniforms.resolution.value=C.mapSize,f.uniforms.radius.value=C.radius,i.setRenderTarget(C.map),i.clear(),i.renderBufferDirect(E,null,P,f,_,null)}function M(C,E,P,b){let x=null;const L=P.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(L!==void 0)x=L;else if(x=P.isPointLight===!0?l:a,i.localClippingEnabled&&E.clipShadows===!0&&Array.isArray(E.clippingPlanes)&&E.clippingPlanes.length!==0||E.displacementMap&&E.displacementScale!==0||E.alphaMap&&E.alphaTest>0||E.map&&E.alphaTest>0){const B=x.uuid,G=E.uuid;let j=c[B];j===void 0&&(j={},c[B]=j);let Y=j[G];Y===void 0&&(Y=x.clone(),j[G]=Y,E.addEventListener("dispose",U)),x=Y}if(x.visible=E.visible,x.wireframe=E.wireframe,b===kn?x.side=E.shadowSide!==null?E.shadowSide:E.side:x.side=E.shadowSide!==null?E.shadowSide:h[E.side],x.alphaMap=E.alphaMap,x.alphaTest=E.alphaTest,x.map=E.map,x.clipShadows=E.clipShadows,x.clippingPlanes=E.clippingPlanes,x.clipIntersection=E.clipIntersection,x.displacementMap=E.displacementMap,x.displacementScale=E.displacementScale,x.displacementBias=E.displacementBias,x.wireframeLinewidth=E.wireframeLinewidth,x.linewidth=E.linewidth,P.isPointLight===!0&&x.isMeshDistanceMaterial===!0){const B=i.properties.get(x);B.light=P}return x}function A(C,E,P,b,x){if(C.visible===!1)return;if(C.layers.test(E.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&x===kn)&&(!C.frustumCulled||n.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,C.matrixWorld);const G=t.update(C),j=C.material;if(Array.isArray(j)){const Y=G.groups;for(let W=0,$=Y.length;W<$;W++){const V=Y[W],ht=j[V.materialIndex];if(ht&&ht.visible){const ft=M(C,ht,b,x);C.onBeforeShadow(i,C,E,P,G,ft,V),i.renderBufferDirect(P,null,G,ft,C,V),C.onAfterShadow(i,C,E,P,G,ft,V)}}}else if(j.visible){const Y=M(C,j,b,x);C.onBeforeShadow(i,C,E,P,G,Y,null),i.renderBufferDirect(P,null,G,Y,C,null),C.onAfterShadow(i,C,E,P,G,Y,null)}}const B=C.children;for(let G=0,j=B.length;G<j;G++)A(B[G],E,P,b,x)}function U(C){C.target.removeEventListener("dispose",U);for(const P in c){const b=c[P],x=C.target.uuid;x in b&&(b[x].dispose(),delete b[x])}}}function Ov(i){function t(){let I=!1;const ot=new Le;let q=null;const Z=new Le(0,0,0,0);return{setMask:function(ct){q!==ct&&!I&&(i.colorMask(ct,ct,ct,ct),q=ct)},setLocked:function(ct){I=ct},setClear:function(ct,Pt,Qt,Me,De){De===!0&&(ct*=Me,Pt*=Me,Qt*=Me),ot.set(ct,Pt,Qt,Me),Z.equals(ot)===!1&&(i.clearColor(ct,Pt,Qt,Me),Z.copy(ot))},reset:function(){I=!1,q=null,Z.set(-1,0,0,0)}}}function e(){let I=!1,ot=null,q=null,Z=null;return{setTest:function(ct){ct?bt(i.DEPTH_TEST):gt(i.DEPTH_TEST)},setMask:function(ct){ot!==ct&&!I&&(i.depthMask(ct),ot=ct)},setFunc:function(ct){if(q!==ct){switch(ct){case lp:i.depthFunc(i.NEVER);break;case cp:i.depthFunc(i.ALWAYS);break;case up:i.depthFunc(i.LESS);break;case uo:i.depthFunc(i.LEQUAL);break;case hp:i.depthFunc(i.EQUAL);break;case dp:i.depthFunc(i.GEQUAL);break;case fp:i.depthFunc(i.GREATER);break;case pp:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}q=ct}},setLocked:function(ct){I=ct},setClear:function(ct){Z!==ct&&(i.clearDepth(ct),Z=ct)},reset:function(){I=!1,ot=null,q=null,Z=null}}}function n(){let I=!1,ot=null,q=null,Z=null,ct=null,Pt=null,Qt=null,Me=null,De=null;return{setTest:function(ne){I||(ne?bt(i.STENCIL_TEST):gt(i.STENCIL_TEST))},setMask:function(ne){ot!==ne&&!I&&(i.stencilMask(ne),ot=ne)},setFunc:function(ne,Ln,bn){(q!==ne||Z!==Ln||ct!==bn)&&(i.stencilFunc(ne,Ln,bn),q=ne,Z=Ln,ct=bn)},setOp:function(ne,Ln,bn){(Pt!==ne||Qt!==Ln||Me!==bn)&&(i.stencilOp(ne,Ln,bn),Pt=ne,Qt=Ln,Me=bn)},setLocked:function(ne){I=ne},setClear:function(ne){De!==ne&&(i.clearStencil(ne),De=ne)},reset:function(){I=!1,ot=null,q=null,Z=null,ct=null,Pt=null,Qt=null,Me=null,De=null}}}const s=new t,r=new e,o=new n,a=new WeakMap,l=new WeakMap;let c={},u={},h=new WeakMap,d=[],f=null,g=!1,_=null,p=null,m=null,y=null,M=null,A=null,U=null,C=new Zt(0,0,0),E=0,P=!1,b=null,x=null,L=null,B=null,G=null;const j=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Y=!1,W=0;const $=i.getParameter(i.VERSION);$.indexOf("WebGL")!==-1?(W=parseFloat(/^WebGL (\d)/.exec($)[1]),Y=W>=1):$.indexOf("OpenGL ES")!==-1&&(W=parseFloat(/^OpenGL ES (\d)/.exec($)[1]),Y=W>=2);let V=null,ht={};const ft=i.getParameter(i.SCISSOR_BOX),Mt=i.getParameter(i.VIEWPORT),kt=new Le().fromArray(ft),ee=new Le().fromArray(Mt);function X(I,ot,q,Z){const ct=new Uint8Array(4),Pt=i.createTexture();i.bindTexture(I,Pt),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Qt=0;Qt<q;Qt++)I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY?i.texImage3D(ot,0,i.RGBA,1,1,Z,0,i.RGBA,i.UNSIGNED_BYTE,ct):i.texImage2D(ot+Qt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ct);return Pt}const nt={};nt[i.TEXTURE_2D]=X(i.TEXTURE_2D,i.TEXTURE_2D,1),nt[i.TEXTURE_CUBE_MAP]=X(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),nt[i.TEXTURE_2D_ARRAY]=X(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),nt[i.TEXTURE_3D]=X(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),r.setClear(1),o.setClear(0),bt(i.DEPTH_TEST),r.setFunc(uo),$t(!1),wt(Lc),bt(i.CULL_FACE),zt(ni);function bt(I){c[I]!==!0&&(i.enable(I),c[I]=!0)}function gt(I){c[I]!==!1&&(i.disable(I),c[I]=!1)}function Rt(I,ot){return u[I]!==ot?(i.bindFramebuffer(I,ot),u[I]=ot,I===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=ot),I===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=ot),!0):!1}function Ut(I,ot){let q=d,Z=!1;if(I){q=h.get(ot),q===void 0&&(q=[],h.set(ot,q));const ct=I.textures;if(q.length!==ct.length||q[0]!==i.COLOR_ATTACHMENT0){for(let Pt=0,Qt=ct.length;Pt<Qt;Pt++)q[Pt]=i.COLOR_ATTACHMENT0+Pt;q.length=ct.length,Z=!0}}else q[0]!==i.BACK&&(q[0]=i.BACK,Z=!0);Z&&i.drawBuffers(q)}function Xt(I){return f!==I?(i.useProgram(I),f=I,!0):!1}const pe={[wi]:i.FUNC_ADD,[Xf]:i.FUNC_SUBTRACT,[Yf]:i.FUNC_REVERSE_SUBTRACT};pe[qf]=i.MIN,pe[$f]=i.MAX;const w={[Kf]:i.ZERO,[jf]:i.ONE,[Zf]:i.SRC_COLOR,[Za]:i.SRC_ALPHA,[ip]:i.SRC_ALPHA_SATURATE,[ep]:i.DST_COLOR,[Qf]:i.DST_ALPHA,[Jf]:i.ONE_MINUS_SRC_COLOR,[Ja]:i.ONE_MINUS_SRC_ALPHA,[np]:i.ONE_MINUS_DST_COLOR,[tp]:i.ONE_MINUS_DST_ALPHA,[sp]:i.CONSTANT_COLOR,[rp]:i.ONE_MINUS_CONSTANT_COLOR,[op]:i.CONSTANT_ALPHA,[ap]:i.ONE_MINUS_CONSTANT_ALPHA};function zt(I,ot,q,Z,ct,Pt,Qt,Me,De,ne){if(I===ni){g===!0&&(gt(i.BLEND),g=!1);return}if(g===!1&&(bt(i.BLEND),g=!0),I!==Wf){if(I!==_||ne!==P){if((p!==wi||M!==wi)&&(i.blendEquation(i.FUNC_ADD),p=wi,M=wi),ne)switch(I){case cs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Pc:i.blendFunc(i.ONE,i.ONE);break;case Ic:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Dc:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case cs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Pc:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Ic:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Dc:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}m=null,y=null,A=null,U=null,C.set(0,0,0),E=0,_=I,P=ne}return}ct=ct||ot,Pt=Pt||q,Qt=Qt||Z,(ot!==p||ct!==M)&&(i.blendEquationSeparate(pe[ot],pe[ct]),p=ot,M=ct),(q!==m||Z!==y||Pt!==A||Qt!==U)&&(i.blendFuncSeparate(w[q],w[Z],w[Pt],w[Qt]),m=q,y=Z,A=Pt,U=Qt),(Me.equals(C)===!1||De!==E)&&(i.blendColor(Me.r,Me.g,Me.b,De),C.copy(Me),E=De),_=I,P=!1}function Ft(I,ot){I.side===_n?gt(i.CULL_FACE):bt(i.CULL_FACE);let q=I.side===je;ot&&(q=!q),$t(q),I.blending===cs&&I.transparent===!1?zt(ni):zt(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),r.setFunc(I.depthFunc),r.setTest(I.depthTest),r.setMask(I.depthWrite),s.setMask(I.colorWrite);const Z=I.stencilWrite;o.setTest(Z),Z&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),Lt(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?bt(i.SAMPLE_ALPHA_TO_COVERAGE):gt(i.SAMPLE_ALPHA_TO_COVERAGE)}function $t(I){b!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),b=I)}function wt(I){I!==Hf?(bt(i.CULL_FACE),I!==x&&(I===Lc?i.cullFace(i.BACK):I===Gf?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):gt(i.CULL_FACE),x=I}function me(I){I!==L&&(Y&&i.lineWidth(I),L=I)}function Lt(I,ot,q){I?(bt(i.POLYGON_OFFSET_FILL),(B!==ot||G!==q)&&(i.polygonOffset(ot,q),B=ot,G=q)):gt(i.POLYGON_OFFSET_FILL)}function Dt(I){I?bt(i.SCISSOR_TEST):gt(i.SCISSOR_TEST)}function R(I){I===void 0&&(I=i.TEXTURE0+j-1),V!==I&&(i.activeTexture(I),V=I)}function v(I,ot,q){q===void 0&&(V===null?q=i.TEXTURE0+j-1:q=V);let Z=ht[q];Z===void 0&&(Z={type:void 0,texture:void 0},ht[q]=Z),(Z.type!==I||Z.texture!==ot)&&(V!==q&&(i.activeTexture(q),V=q),i.bindTexture(I,ot||nt[I]),Z.type=I,Z.texture=ot)}function H(){const I=ht[V];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function J(){try{i.compressedTexImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function tt(){try{i.compressedTexImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Q(){try{i.texSubImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ct(){try{i.texSubImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function dt(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function xt(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ht(){try{i.texStorage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function rt(){try{i.texStorage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function vt(){try{i.texImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Jt(){try{i.texImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ot(I){kt.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),kt.copy(I))}function St(I){ee.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),ee.copy(I))}function Bt(I,ot){let q=l.get(ot);q===void 0&&(q=new WeakMap,l.set(ot,q));let Z=q.get(I);Z===void 0&&(Z=i.getUniformBlockIndex(ot,I.name),q.set(I,Z))}function Yt(I,ot){const Z=l.get(ot).get(I);a.get(ot)!==Z&&(i.uniformBlockBinding(ot,Z,I.__bindingPointIndex),a.set(ot,Z))}function ge(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),c={},V=null,ht={},u={},h=new WeakMap,d=[],f=null,g=!1,_=null,p=null,m=null,y=null,M=null,A=null,U=null,C=new Zt(0,0,0),E=0,P=!1,b=null,x=null,L=null,B=null,G=null,kt.set(0,0,i.canvas.width,i.canvas.height),ee.set(0,0,i.canvas.width,i.canvas.height),s.reset(),r.reset(),o.reset()}return{buffers:{color:s,depth:r,stencil:o},enable:bt,disable:gt,bindFramebuffer:Rt,drawBuffers:Ut,useProgram:Xt,setBlending:zt,setMaterial:Ft,setFlipSided:$t,setCullFace:wt,setLineWidth:me,setPolygonOffset:Lt,setScissorTest:Dt,activeTexture:R,bindTexture:v,unbindTexture:H,compressedTexImage2D:J,compressedTexImage3D:tt,texImage2D:vt,texImage3D:Jt,updateUBOMapping:Bt,uniformBlockBinding:Yt,texStorage2D:Ht,texStorage3D:rt,texSubImage2D:Q,texSubImage3D:Ct,compressedTexSubImage2D:dt,compressedTexSubImage3D:xt,scissor:Ot,viewport:St,reset:ge}}function Eu(i,t,e,n){const s=kv(n);switch(e){case Gh:return i*t;case Wh:return i*t;case Xh:return i*t*2;case Zl:return i*t/s.components*s.byteLength;case Jl:return i*t/s.components*s.byteLength;case Yh:return i*t*2/s.components*s.byteLength;case Ql:return i*t*2/s.components*s.byteLength;case Vh:return i*t*3/s.components*s.byteLength;case xn:return i*t*4/s.components*s.byteLength;case tc:return i*t*4/s.components*s.byteLength;case eo:case no:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case io:case so:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case il:case rl:return Math.max(i,16)*Math.max(t,8)/4;case nl:case sl:return Math.max(i,8)*Math.max(t,8)/2;case ol:case al:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case ll:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case cl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case ul:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case hl:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case dl:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case fl:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case pl:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case ml:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case gl:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case _l:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case vl:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case xl:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Sl:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Ml:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case bl:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case ro:case yl:case El:return Math.ceil(i/4)*Math.ceil(t/4)*16;case qh:case wl:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Al:case Tl:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function kv(i){switch(i){case Hn:case Bh:return{byteLength:1,components:1};case er:case zh:case ar:return{byteLength:2,components:1};case Kl:case jl:return{byteLength:2,components:4};case Pi:case $l:case Tn:return{byteLength:4,components:1};case Hh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function Fv(i,t,e,n,s,r,o){const a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Kt,u=new WeakMap;let h;const d=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,v){return f?new OffscreenCanvas(R,v):go("canvas")}function _(R,v,H){let J=1;const tt=Dt(R);if((tt.width>H||tt.height>H)&&(J=H/Math.max(tt.width,tt.height)),J<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const Q=Math.floor(J*tt.width),Ct=Math.floor(J*tt.height);h===void 0&&(h=g(Q,Ct));const dt=v?g(Q,Ct):h;return dt.width=Q,dt.height=Ct,dt.getContext("2d").drawImage(R,0,0,Q,Ct),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+tt.width+"x"+tt.height+") to ("+Q+"x"+Ct+")."),dt}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+tt.width+"x"+tt.height+")."),R;return R}function p(R){return R.generateMipmaps&&R.minFilter!==we&&R.minFilter!==vn}function m(R){i.generateMipmap(R)}function y(R,v,H,J,tt=!1){if(R!==null){if(i[R]!==void 0)return i[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let Q=v;if(v===i.RED&&(H===i.FLOAT&&(Q=i.R32F),H===i.HALF_FLOAT&&(Q=i.R16F),H===i.UNSIGNED_BYTE&&(Q=i.R8)),v===i.RED_INTEGER&&(H===i.UNSIGNED_BYTE&&(Q=i.R8UI),H===i.UNSIGNED_SHORT&&(Q=i.R16UI),H===i.UNSIGNED_INT&&(Q=i.R32UI),H===i.BYTE&&(Q=i.R8I),H===i.SHORT&&(Q=i.R16I),H===i.INT&&(Q=i.R32I)),v===i.RG&&(H===i.FLOAT&&(Q=i.RG32F),H===i.HALF_FLOAT&&(Q=i.RG16F),H===i.UNSIGNED_BYTE&&(Q=i.RG8)),v===i.RG_INTEGER&&(H===i.UNSIGNED_BYTE&&(Q=i.RG8UI),H===i.UNSIGNED_SHORT&&(Q=i.RG16UI),H===i.UNSIGNED_INT&&(Q=i.RG32UI),H===i.BYTE&&(Q=i.RG8I),H===i.SHORT&&(Q=i.RG16I),H===i.INT&&(Q=i.RG32I)),v===i.RGB&&H===i.UNSIGNED_INT_5_9_9_9_REV&&(Q=i.RGB9_E5),v===i.RGBA){const Ct=tt?ho:oe.getTransfer(J);H===i.FLOAT&&(Q=i.RGBA32F),H===i.HALF_FLOAT&&(Q=i.RGBA16F),H===i.UNSIGNED_BYTE&&(Q=Ct===de?i.SRGB8_ALPHA8:i.RGBA8),H===i.UNSIGNED_SHORT_4_4_4_4&&(Q=i.RGBA4),H===i.UNSIGNED_SHORT_5_5_5_1&&(Q=i.RGB5_A1)}return(Q===i.R16F||Q===i.R32F||Q===i.RG16F||Q===i.RG32F||Q===i.RGBA16F||Q===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Q}function M(R,v){let H;return R?v===null||v===Pi||v===_s?H=i.DEPTH24_STENCIL8:v===Tn?H=i.DEPTH32F_STENCIL8:v===er&&(H=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===Pi||v===_s?H=i.DEPTH_COMPONENT24:v===Tn?H=i.DEPTH_COMPONENT32F:v===er&&(H=i.DEPTH_COMPONENT16),H}function A(R,v){return p(R)===!0||R.isFramebufferTexture&&R.minFilter!==we&&R.minFilter!==vn?Math.log2(Math.max(v.width,v.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?v.mipmaps.length:1}function U(R){const v=R.target;v.removeEventListener("dispose",U),E(v),v.isVideoTexture&&u.delete(v)}function C(R){const v=R.target;v.removeEventListener("dispose",C),b(v)}function E(R){const v=n.get(R);if(v.__webglInit===void 0)return;const H=R.source,J=d.get(H);if(J){const tt=J[v.__cacheKey];tt.usedTimes--,tt.usedTimes===0&&P(R),Object.keys(J).length===0&&d.delete(H)}n.remove(R)}function P(R){const v=n.get(R);i.deleteTexture(v.__webglTexture);const H=R.source,J=d.get(H);delete J[v.__cacheKey],o.memory.textures--}function b(R){const v=n.get(R);if(R.depthTexture&&R.depthTexture.dispose(),R.isWebGLCubeRenderTarget)for(let J=0;J<6;J++){if(Array.isArray(v.__webglFramebuffer[J]))for(let tt=0;tt<v.__webglFramebuffer[J].length;tt++)i.deleteFramebuffer(v.__webglFramebuffer[J][tt]);else i.deleteFramebuffer(v.__webglFramebuffer[J]);v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer[J])}else{if(Array.isArray(v.__webglFramebuffer))for(let J=0;J<v.__webglFramebuffer.length;J++)i.deleteFramebuffer(v.__webglFramebuffer[J]);else i.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&i.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let J=0;J<v.__webglColorRenderbuffer.length;J++)v.__webglColorRenderbuffer[J]&&i.deleteRenderbuffer(v.__webglColorRenderbuffer[J]);v.__webglDepthRenderbuffer&&i.deleteRenderbuffer(v.__webglDepthRenderbuffer)}const H=R.textures;for(let J=0,tt=H.length;J<tt;J++){const Q=n.get(H[J]);Q.__webglTexture&&(i.deleteTexture(Q.__webglTexture),o.memory.textures--),n.remove(H[J])}n.remove(R)}let x=0;function L(){x=0}function B(){const R=x;return R>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+s.maxTextures),x+=1,R}function G(R){const v=[];return v.push(R.wrapS),v.push(R.wrapT),v.push(R.wrapR||0),v.push(R.magFilter),v.push(R.minFilter),v.push(R.anisotropy),v.push(R.internalFormat),v.push(R.format),v.push(R.type),v.push(R.generateMipmaps),v.push(R.premultiplyAlpha),v.push(R.flipY),v.push(R.unpackAlignment),v.push(R.colorSpace),v.join()}function j(R,v){const H=n.get(R);if(R.isVideoTexture&&me(R),R.isRenderTargetTexture===!1&&R.version>0&&H.__version!==R.version){const J=R.image;if(J===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(J.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ee(H,R,v);return}}e.bindTexture(i.TEXTURE_2D,H.__webglTexture,i.TEXTURE0+v)}function Y(R,v){const H=n.get(R);if(R.version>0&&H.__version!==R.version){ee(H,R,v);return}e.bindTexture(i.TEXTURE_2D_ARRAY,H.__webglTexture,i.TEXTURE0+v)}function W(R,v){const H=n.get(R);if(R.version>0&&H.__version!==R.version){ee(H,R,v);return}e.bindTexture(i.TEXTURE_3D,H.__webglTexture,i.TEXTURE0+v)}function $(R,v){const H=n.get(R);if(R.version>0&&H.__version!==R.version){X(H,R,v);return}e.bindTexture(i.TEXTURE_CUBE_MAP,H.__webglTexture,i.TEXTURE0+v)}const V={[tr]:i.REPEAT,[Fn]:i.CLAMP_TO_EDGE,[el]:i.MIRRORED_REPEAT},ht={[we]:i.NEAREST,[Ep]:i.NEAREST_MIPMAP_NEAREST,[mr]:i.NEAREST_MIPMAP_LINEAR,[vn]:i.LINEAR,[jo]:i.LINEAR_MIPMAP_NEAREST,[Ti]:i.LINEAR_MIPMAP_LINEAR},ft={[Cp]:i.NEVER,[Up]:i.ALWAYS,[Lp]:i.LESS,[$h]:i.LEQUAL,[Pp]:i.EQUAL,[Np]:i.GEQUAL,[Ip]:i.GREATER,[Dp]:i.NOTEQUAL};function Mt(R,v){if(v.type===Tn&&t.has("OES_texture_float_linear")===!1&&(v.magFilter===vn||v.magFilter===jo||v.magFilter===mr||v.magFilter===Ti||v.minFilter===vn||v.minFilter===jo||v.minFilter===mr||v.minFilter===Ti)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(R,i.TEXTURE_WRAP_S,V[v.wrapS]),i.texParameteri(R,i.TEXTURE_WRAP_T,V[v.wrapT]),(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)&&i.texParameteri(R,i.TEXTURE_WRAP_R,V[v.wrapR]),i.texParameteri(R,i.TEXTURE_MAG_FILTER,ht[v.magFilter]),i.texParameteri(R,i.TEXTURE_MIN_FILTER,ht[v.minFilter]),v.compareFunction&&(i.texParameteri(R,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(R,i.TEXTURE_COMPARE_FUNC,ft[v.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===we||v.minFilter!==mr&&v.minFilter!==Ti||v.type===Tn&&t.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||n.get(v).__currentAnisotropy){const H=t.get("EXT_texture_filter_anisotropic");i.texParameterf(R,H.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy}}}function kt(R,v){let H=!1;R.__webglInit===void 0&&(R.__webglInit=!0,v.addEventListener("dispose",U));const J=v.source;let tt=d.get(J);tt===void 0&&(tt={},d.set(J,tt));const Q=G(v);if(Q!==R.__cacheKey){tt[Q]===void 0&&(tt[Q]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,H=!0),tt[Q].usedTimes++;const Ct=tt[R.__cacheKey];Ct!==void 0&&(tt[R.__cacheKey].usedTimes--,Ct.usedTimes===0&&P(v)),R.__cacheKey=Q,R.__webglTexture=tt[Q].texture}return H}function ee(R,v,H){let J=i.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(J=i.TEXTURE_2D_ARRAY),v.isData3DTexture&&(J=i.TEXTURE_3D);const tt=kt(R,v),Q=v.source;e.bindTexture(J,R.__webglTexture,i.TEXTURE0+H);const Ct=n.get(Q);if(Q.version!==Ct.__version||tt===!0){e.activeTexture(i.TEXTURE0+H);const dt=oe.getPrimaries(oe.workingColorSpace),xt=v.colorSpace===ti?null:oe.getPrimaries(v.colorSpace),Ht=v.colorSpace===ti||dt===xt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ht);let rt=_(v.image,!1,s.maxTextureSize);rt=Lt(v,rt);const vt=r.convert(v.format,v.colorSpace),Jt=r.convert(v.type);let Ot=y(v.internalFormat,vt,Jt,v.colorSpace,v.isVideoTexture);Mt(J,v);let St;const Bt=v.mipmaps,Yt=v.isVideoTexture!==!0,ge=Ct.__version===void 0||tt===!0,I=Q.dataReady,ot=A(v,rt);if(v.isDepthTexture)Ot=M(v.format===vs,v.type),ge&&(Yt?e.texStorage2D(i.TEXTURE_2D,1,Ot,rt.width,rt.height):e.texImage2D(i.TEXTURE_2D,0,Ot,rt.width,rt.height,0,vt,Jt,null));else if(v.isDataTexture)if(Bt.length>0){Yt&&ge&&e.texStorage2D(i.TEXTURE_2D,ot,Ot,Bt[0].width,Bt[0].height);for(let q=0,Z=Bt.length;q<Z;q++)St=Bt[q],Yt?I&&e.texSubImage2D(i.TEXTURE_2D,q,0,0,St.width,St.height,vt,Jt,St.data):e.texImage2D(i.TEXTURE_2D,q,Ot,St.width,St.height,0,vt,Jt,St.data);v.generateMipmaps=!1}else Yt?(ge&&e.texStorage2D(i.TEXTURE_2D,ot,Ot,rt.width,rt.height),I&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,rt.width,rt.height,vt,Jt,rt.data)):e.texImage2D(i.TEXTURE_2D,0,Ot,rt.width,rt.height,0,vt,Jt,rt.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){Yt&&ge&&e.texStorage3D(i.TEXTURE_2D_ARRAY,ot,Ot,Bt[0].width,Bt[0].height,rt.depth);for(let q=0,Z=Bt.length;q<Z;q++)if(St=Bt[q],v.format!==xn)if(vt!==null)if(Yt){if(I)if(v.layerUpdates.size>0){const ct=Eu(St.width,St.height,v.format,v.type);for(const Pt of v.layerUpdates){const Qt=St.data.subarray(Pt*ct/St.data.BYTES_PER_ELEMENT,(Pt+1)*ct/St.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,q,0,0,Pt,St.width,St.height,1,vt,Qt,0,0)}v.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,q,0,0,0,St.width,St.height,rt.depth,vt,St.data,0,0)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,q,Ot,St.width,St.height,rt.depth,0,St.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Yt?I&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,q,0,0,0,St.width,St.height,rt.depth,vt,Jt,St.data):e.texImage3D(i.TEXTURE_2D_ARRAY,q,Ot,St.width,St.height,rt.depth,0,vt,Jt,St.data)}else{Yt&&ge&&e.texStorage2D(i.TEXTURE_2D,ot,Ot,Bt[0].width,Bt[0].height);for(let q=0,Z=Bt.length;q<Z;q++)St=Bt[q],v.format!==xn?vt!==null?Yt?I&&e.compressedTexSubImage2D(i.TEXTURE_2D,q,0,0,St.width,St.height,vt,St.data):e.compressedTexImage2D(i.TEXTURE_2D,q,Ot,St.width,St.height,0,St.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Yt?I&&e.texSubImage2D(i.TEXTURE_2D,q,0,0,St.width,St.height,vt,Jt,St.data):e.texImage2D(i.TEXTURE_2D,q,Ot,St.width,St.height,0,vt,Jt,St.data)}else if(v.isDataArrayTexture)if(Yt){if(ge&&e.texStorage3D(i.TEXTURE_2D_ARRAY,ot,Ot,rt.width,rt.height,rt.depth),I)if(v.layerUpdates.size>0){const q=Eu(rt.width,rt.height,v.format,v.type);for(const Z of v.layerUpdates){const ct=rt.data.subarray(Z*q/rt.data.BYTES_PER_ELEMENT,(Z+1)*q/rt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Z,rt.width,rt.height,1,vt,Jt,ct)}v.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,rt.width,rt.height,rt.depth,vt,Jt,rt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Ot,rt.width,rt.height,rt.depth,0,vt,Jt,rt.data);else if(v.isData3DTexture)Yt?(ge&&e.texStorage3D(i.TEXTURE_3D,ot,Ot,rt.width,rt.height,rt.depth),I&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,rt.width,rt.height,rt.depth,vt,Jt,rt.data)):e.texImage3D(i.TEXTURE_3D,0,Ot,rt.width,rt.height,rt.depth,0,vt,Jt,rt.data);else if(v.isFramebufferTexture){if(ge)if(Yt)e.texStorage2D(i.TEXTURE_2D,ot,Ot,rt.width,rt.height);else{let q=rt.width,Z=rt.height;for(let ct=0;ct<ot;ct++)e.texImage2D(i.TEXTURE_2D,ct,Ot,q,Z,0,vt,Jt,null),q>>=1,Z>>=1}}else if(Bt.length>0){if(Yt&&ge){const q=Dt(Bt[0]);e.texStorage2D(i.TEXTURE_2D,ot,Ot,q.width,q.height)}for(let q=0,Z=Bt.length;q<Z;q++)St=Bt[q],Yt?I&&e.texSubImage2D(i.TEXTURE_2D,q,0,0,vt,Jt,St):e.texImage2D(i.TEXTURE_2D,q,Ot,vt,Jt,St);v.generateMipmaps=!1}else if(Yt){if(ge){const q=Dt(rt);e.texStorage2D(i.TEXTURE_2D,ot,Ot,q.width,q.height)}I&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,vt,Jt,rt)}else e.texImage2D(i.TEXTURE_2D,0,Ot,vt,Jt,rt);p(v)&&m(J),Ct.__version=Q.version,v.onUpdate&&v.onUpdate(v)}R.__version=v.version}function X(R,v,H){if(v.image.length!==6)return;const J=kt(R,v),tt=v.source;e.bindTexture(i.TEXTURE_CUBE_MAP,R.__webglTexture,i.TEXTURE0+H);const Q=n.get(tt);if(tt.version!==Q.__version||J===!0){e.activeTexture(i.TEXTURE0+H);const Ct=oe.getPrimaries(oe.workingColorSpace),dt=v.colorSpace===ti?null:oe.getPrimaries(v.colorSpace),xt=v.colorSpace===ti||Ct===dt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,xt);const Ht=v.isCompressedTexture||v.image[0].isCompressedTexture,rt=v.image[0]&&v.image[0].isDataTexture,vt=[];for(let Z=0;Z<6;Z++)!Ht&&!rt?vt[Z]=_(v.image[Z],!0,s.maxCubemapSize):vt[Z]=rt?v.image[Z].image:v.image[Z],vt[Z]=Lt(v,vt[Z]);const Jt=vt[0],Ot=r.convert(v.format,v.colorSpace),St=r.convert(v.type),Bt=y(v.internalFormat,Ot,St,v.colorSpace),Yt=v.isVideoTexture!==!0,ge=Q.__version===void 0||J===!0,I=tt.dataReady;let ot=A(v,Jt);Mt(i.TEXTURE_CUBE_MAP,v);let q;if(Ht){Yt&&ge&&e.texStorage2D(i.TEXTURE_CUBE_MAP,ot,Bt,Jt.width,Jt.height);for(let Z=0;Z<6;Z++){q=vt[Z].mipmaps;for(let ct=0;ct<q.length;ct++){const Pt=q[ct];v.format!==xn?Ot!==null?Yt?I&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ct,0,0,Pt.width,Pt.height,Ot,Pt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ct,Bt,Pt.width,Pt.height,0,Pt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Yt?I&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ct,0,0,Pt.width,Pt.height,Ot,St,Pt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ct,Bt,Pt.width,Pt.height,0,Ot,St,Pt.data)}}}else{if(q=v.mipmaps,Yt&&ge){q.length>0&&ot++;const Z=Dt(vt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,ot,Bt,Z.width,Z.height)}for(let Z=0;Z<6;Z++)if(rt){Yt?I&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,vt[Z].width,vt[Z].height,Ot,St,vt[Z].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,Bt,vt[Z].width,vt[Z].height,0,Ot,St,vt[Z].data);for(let ct=0;ct<q.length;ct++){const Qt=q[ct].image[Z].image;Yt?I&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ct+1,0,0,Qt.width,Qt.height,Ot,St,Qt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ct+1,Bt,Qt.width,Qt.height,0,Ot,St,Qt.data)}}else{Yt?I&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,Ot,St,vt[Z]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,Bt,Ot,St,vt[Z]);for(let ct=0;ct<q.length;ct++){const Pt=q[ct];Yt?I&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ct+1,0,0,Ot,St,Pt.image[Z]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ct+1,Bt,Ot,St,Pt.image[Z])}}}p(v)&&m(i.TEXTURE_CUBE_MAP),Q.__version=tt.version,v.onUpdate&&v.onUpdate(v)}R.__version=v.version}function nt(R,v,H,J,tt,Q){const Ct=r.convert(H.format,H.colorSpace),dt=r.convert(H.type),xt=y(H.internalFormat,Ct,dt,H.colorSpace);if(!n.get(v).__hasExternalTextures){const rt=Math.max(1,v.width>>Q),vt=Math.max(1,v.height>>Q);tt===i.TEXTURE_3D||tt===i.TEXTURE_2D_ARRAY?e.texImage3D(tt,Q,xt,rt,vt,v.depth,0,Ct,dt,null):e.texImage2D(tt,Q,xt,rt,vt,0,Ct,dt,null)}e.bindFramebuffer(i.FRAMEBUFFER,R),wt(v)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,J,tt,n.get(H).__webglTexture,0,$t(v)):(tt===i.TEXTURE_2D||tt>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&tt<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,J,tt,n.get(H).__webglTexture,Q),e.bindFramebuffer(i.FRAMEBUFFER,null)}function bt(R,v,H){if(i.bindRenderbuffer(i.RENDERBUFFER,R),v.depthBuffer){const J=v.depthTexture,tt=J&&J.isDepthTexture?J.type:null,Q=M(v.stencilBuffer,tt),Ct=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,dt=$t(v);wt(v)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,dt,Q,v.width,v.height):H?i.renderbufferStorageMultisample(i.RENDERBUFFER,dt,Q,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,Q,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Ct,i.RENDERBUFFER,R)}else{const J=v.textures;for(let tt=0;tt<J.length;tt++){const Q=J[tt],Ct=r.convert(Q.format,Q.colorSpace),dt=r.convert(Q.type),xt=y(Q.internalFormat,Ct,dt,Q.colorSpace),Ht=$t(v);H&&wt(v)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ht,xt,v.width,v.height):wt(v)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ht,xt,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,xt,v.width,v.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function gt(R,v){if(v&&v.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,R),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(v.depthTexture).__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),j(v.depthTexture,0);const J=n.get(v.depthTexture).__webglTexture,tt=$t(v);if(v.depthTexture.format===us)wt(v)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,J,0,tt):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,J,0);else if(v.depthTexture.format===vs)wt(v)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,J,0,tt):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,J,0);else throw new Error("Unknown depthTexture format")}function Rt(R){const v=n.get(R),H=R.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==R.depthTexture){const J=R.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),J){const tt=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,J.removeEventListener("dispose",tt)};J.addEventListener("dispose",tt),v.__depthDisposeCallback=tt}v.__boundDepthTexture=J}if(R.depthTexture&&!v.__autoAllocateDepthBuffer){if(H)throw new Error("target.depthTexture not supported in Cube render targets");gt(v.__webglFramebuffer,R)}else if(H){v.__webglDepthbuffer=[];for(let J=0;J<6;J++)if(e.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[J]),v.__webglDepthbuffer[J]===void 0)v.__webglDepthbuffer[J]=i.createRenderbuffer(),bt(v.__webglDepthbuffer[J],R,!1);else{const tt=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Q=v.__webglDepthbuffer[J];i.bindRenderbuffer(i.RENDERBUFFER,Q),i.framebufferRenderbuffer(i.FRAMEBUFFER,tt,i.RENDERBUFFER,Q)}}else if(e.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=i.createRenderbuffer(),bt(v.__webglDepthbuffer,R,!1);else{const J=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,tt=v.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,tt),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,tt)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function Ut(R,v,H){const J=n.get(R);v!==void 0&&nt(J.__webglFramebuffer,R,R.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),H!==void 0&&Rt(R)}function Xt(R){const v=R.texture,H=n.get(R),J=n.get(v);R.addEventListener("dispose",C);const tt=R.textures,Q=R.isWebGLCubeRenderTarget===!0,Ct=tt.length>1;if(Ct||(J.__webglTexture===void 0&&(J.__webglTexture=i.createTexture()),J.__version=v.version,o.memory.textures++),Q){H.__webglFramebuffer=[];for(let dt=0;dt<6;dt++)if(v.mipmaps&&v.mipmaps.length>0){H.__webglFramebuffer[dt]=[];for(let xt=0;xt<v.mipmaps.length;xt++)H.__webglFramebuffer[dt][xt]=i.createFramebuffer()}else H.__webglFramebuffer[dt]=i.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){H.__webglFramebuffer=[];for(let dt=0;dt<v.mipmaps.length;dt++)H.__webglFramebuffer[dt]=i.createFramebuffer()}else H.__webglFramebuffer=i.createFramebuffer();if(Ct)for(let dt=0,xt=tt.length;dt<xt;dt++){const Ht=n.get(tt[dt]);Ht.__webglTexture===void 0&&(Ht.__webglTexture=i.createTexture(),o.memory.textures++)}if(R.samples>0&&wt(R)===!1){H.__webglMultisampledFramebuffer=i.createFramebuffer(),H.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let dt=0;dt<tt.length;dt++){const xt=tt[dt];H.__webglColorRenderbuffer[dt]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,H.__webglColorRenderbuffer[dt]);const Ht=r.convert(xt.format,xt.colorSpace),rt=r.convert(xt.type),vt=y(xt.internalFormat,Ht,rt,xt.colorSpace,R.isXRRenderTarget===!0),Jt=$t(R);i.renderbufferStorageMultisample(i.RENDERBUFFER,Jt,vt,R.width,R.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+dt,i.RENDERBUFFER,H.__webglColorRenderbuffer[dt])}i.bindRenderbuffer(i.RENDERBUFFER,null),R.depthBuffer&&(H.__webglDepthRenderbuffer=i.createRenderbuffer(),bt(H.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Q){e.bindTexture(i.TEXTURE_CUBE_MAP,J.__webglTexture),Mt(i.TEXTURE_CUBE_MAP,v);for(let dt=0;dt<6;dt++)if(v.mipmaps&&v.mipmaps.length>0)for(let xt=0;xt<v.mipmaps.length;xt++)nt(H.__webglFramebuffer[dt][xt],R,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+dt,xt);else nt(H.__webglFramebuffer[dt],R,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+dt,0);p(v)&&m(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(Ct){for(let dt=0,xt=tt.length;dt<xt;dt++){const Ht=tt[dt],rt=n.get(Ht);e.bindTexture(i.TEXTURE_2D,rt.__webglTexture),Mt(i.TEXTURE_2D,Ht),nt(H.__webglFramebuffer,R,Ht,i.COLOR_ATTACHMENT0+dt,i.TEXTURE_2D,0),p(Ht)&&m(i.TEXTURE_2D)}e.unbindTexture()}else{let dt=i.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(dt=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(dt,J.__webglTexture),Mt(dt,v),v.mipmaps&&v.mipmaps.length>0)for(let xt=0;xt<v.mipmaps.length;xt++)nt(H.__webglFramebuffer[xt],R,v,i.COLOR_ATTACHMENT0,dt,xt);else nt(H.__webglFramebuffer,R,v,i.COLOR_ATTACHMENT0,dt,0);p(v)&&m(dt),e.unbindTexture()}R.depthBuffer&&Rt(R)}function pe(R){const v=R.textures;for(let H=0,J=v.length;H<J;H++){const tt=v[H];if(p(tt)){const Q=R.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,Ct=n.get(tt).__webglTexture;e.bindTexture(Q,Ct),m(Q),e.unbindTexture()}}}const w=[],zt=[];function Ft(R){if(R.samples>0){if(wt(R)===!1){const v=R.textures,H=R.width,J=R.height;let tt=i.COLOR_BUFFER_BIT;const Q=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Ct=n.get(R),dt=v.length>1;if(dt)for(let xt=0;xt<v.length;xt++)e.bindFramebuffer(i.FRAMEBUFFER,Ct.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+xt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,Ct.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+xt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,Ct.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ct.__webglFramebuffer);for(let xt=0;xt<v.length;xt++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(tt|=i.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(tt|=i.STENCIL_BUFFER_BIT)),dt){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Ct.__webglColorRenderbuffer[xt]);const Ht=n.get(v[xt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Ht,0)}i.blitFramebuffer(0,0,H,J,0,0,H,J,tt,i.NEAREST),l===!0&&(w.length=0,zt.length=0,w.push(i.COLOR_ATTACHMENT0+xt),R.depthBuffer&&R.resolveDepthBuffer===!1&&(w.push(Q),zt.push(Q),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,zt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,w))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),dt)for(let xt=0;xt<v.length;xt++){e.bindFramebuffer(i.FRAMEBUFFER,Ct.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+xt,i.RENDERBUFFER,Ct.__webglColorRenderbuffer[xt]);const Ht=n.get(v[xt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,Ct.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+xt,i.TEXTURE_2D,Ht,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ct.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){const v=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[v])}}}function $t(R){return Math.min(s.maxSamples,R.samples)}function wt(R){const v=n.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function me(R){const v=o.render.frame;u.get(R)!==v&&(u.set(R,v),R.update())}function Lt(R,v){const H=R.colorSpace,J=R.format,tt=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||H!==ai&&H!==ti&&(oe.getTransfer(H)===de?(J!==xn||tt!==Hn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",H)),v}function Dt(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=B,this.resetTextureUnits=L,this.setTexture2D=j,this.setTexture2DArray=Y,this.setTexture3D=W,this.setTextureCube=$,this.rebindTextures=Ut,this.setupRenderTarget=Xt,this.updateRenderTargetMipmap=pe,this.updateMultisampleRenderTarget=Ft,this.setupDepthRenderbuffer=Rt,this.setupFrameBufferTexture=nt,this.useMultisampledRTT=wt}function Bv(i,t){function e(n,s=ti){let r;const o=oe.getTransfer(s);if(n===Hn)return i.UNSIGNED_BYTE;if(n===Kl)return i.UNSIGNED_SHORT_4_4_4_4;if(n===jl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Hh)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Bh)return i.BYTE;if(n===zh)return i.SHORT;if(n===er)return i.UNSIGNED_SHORT;if(n===$l)return i.INT;if(n===Pi)return i.UNSIGNED_INT;if(n===Tn)return i.FLOAT;if(n===ar)return i.HALF_FLOAT;if(n===Gh)return i.ALPHA;if(n===Vh)return i.RGB;if(n===xn)return i.RGBA;if(n===Wh)return i.LUMINANCE;if(n===Xh)return i.LUMINANCE_ALPHA;if(n===us)return i.DEPTH_COMPONENT;if(n===vs)return i.DEPTH_STENCIL;if(n===Zl)return i.RED;if(n===Jl)return i.RED_INTEGER;if(n===Yh)return i.RG;if(n===Ql)return i.RG_INTEGER;if(n===tc)return i.RGBA_INTEGER;if(n===eo||n===no||n===io||n===so)if(o===de)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===eo)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===no)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===io)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===so)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===eo)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===no)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===io)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===so)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===nl||n===il||n===sl||n===rl)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===nl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===il)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===sl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===rl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ol||n===al||n===ll)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===ol||n===al)return o===de?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===ll)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===cl||n===ul||n===hl||n===dl||n===fl||n===pl||n===ml||n===gl||n===_l||n===vl||n===xl||n===Sl||n===Ml||n===bl)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===cl)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ul)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===hl)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===dl)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===fl)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===pl)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===ml)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===gl)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===_l)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===vl)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===xl)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Sl)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Ml)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===bl)return o===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ro||n===yl||n===El)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===ro)return o===de?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===yl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===El)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===qh||n===wl||n===Al||n===Tl)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===ro)return r.COMPRESSED_RED_RGTC1_EXT;if(n===wl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Al)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Tl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===_s?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}class zv extends an{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class Ks extends ze{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Hv={type:"move"};class ba{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ks,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ks,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new k,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new k),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ks,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new k,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new k),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(const _ of t.hand.values()){const p=e.getJointPose(_,n),m=this._getHandJoint(c,_);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}const u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Hv)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new Ks;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const Gv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Vv=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Wv{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const s=new Be,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new Sn({vertexShader:Gv,fragmentShader:Vv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Ke(new cr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Xv extends ys{constructor(t,e){super();const n=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,d=null,f=null,g=null;const _=new Wv,p=e.getContextAttributes();let m=null,y=null;const M=[],A=[],U=new Kt;let C=null;const E=new an;E.layers.enable(1),E.viewport=new Le;const P=new an;P.layers.enable(2),P.viewport=new Le;const b=[E,P],x=new zv;x.layers.enable(1),x.layers.enable(2);let L=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let nt=M[X];return nt===void 0&&(nt=new ba,M[X]=nt),nt.getTargetRaySpace()},this.getControllerGrip=function(X){let nt=M[X];return nt===void 0&&(nt=new ba,M[X]=nt),nt.getGripSpace()},this.getHand=function(X){let nt=M[X];return nt===void 0&&(nt=new ba,M[X]=nt),nt.getHandSpace()};function G(X){const nt=A.indexOf(X.inputSource);if(nt===-1)return;const bt=M[nt];bt!==void 0&&(bt.update(X.inputSource,X.frame,c||o),bt.dispatchEvent({type:X.type,data:X.inputSource}))}function j(){s.removeEventListener("select",G),s.removeEventListener("selectstart",G),s.removeEventListener("selectend",G),s.removeEventListener("squeeze",G),s.removeEventListener("squeezestart",G),s.removeEventListener("squeezeend",G),s.removeEventListener("end",j),s.removeEventListener("inputsourceschange",Y);for(let X=0;X<M.length;X++){const nt=A[X];nt!==null&&(A[X]=null,M[X].disconnect(nt))}L=null,B=null,_.reset(),t.setRenderTarget(m),f=null,d=null,h=null,s=null,y=null,ee.stop(),n.isPresenting=!1,t.setPixelRatio(C),t.setSize(U.width,U.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){r=X,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){a=X,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(X){c=X},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(X){if(s=X,s!==null){if(m=t.getRenderTarget(),s.addEventListener("select",G),s.addEventListener("selectstart",G),s.addEventListener("selectend",G),s.addEventListener("squeeze",G),s.addEventListener("squeezestart",G),s.addEventListener("squeezeend",G),s.addEventListener("end",j),s.addEventListener("inputsourceschange",Y),p.xrCompatible!==!0&&await e.makeXRCompatible(),C=t.getPixelRatio(),t.getSize(U),s.renderState.layers===void 0){const nt={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,e,nt),s.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new Ii(f.framebufferWidth,f.framebufferHeight,{format:xn,type:Hn,colorSpace:t.outputColorSpace,stencilBuffer:p.stencil})}else{let nt=null,bt=null,gt=null;p.depth&&(gt=p.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,nt=p.stencil?vs:us,bt=p.stencil?_s:Pi);const Rt={colorFormat:e.RGBA8,depthFormat:gt,scaleFactor:r};h=new XRWebGLBinding(s,e),d=h.createProjectionLayer(Rt),s.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),y=new Ii(d.textureWidth,d.textureHeight,{format:xn,type:Hn,depthTexture:new ld(d.textureWidth,d.textureHeight,bt,void 0,void 0,void 0,void 0,void 0,void 0,nt),stencilBuffer:p.stencil,colorSpace:t.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),ee.setContext(s),ee.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function Y(X){for(let nt=0;nt<X.removed.length;nt++){const bt=X.removed[nt],gt=A.indexOf(bt);gt>=0&&(A[gt]=null,M[gt].disconnect(bt))}for(let nt=0;nt<X.added.length;nt++){const bt=X.added[nt];let gt=A.indexOf(bt);if(gt===-1){for(let Ut=0;Ut<M.length;Ut++)if(Ut>=A.length){A.push(bt),gt=Ut;break}else if(A[Ut]===null){A[Ut]=bt,gt=Ut;break}if(gt===-1)break}const Rt=M[gt];Rt&&Rt.connect(bt)}}const W=new k,$=new k;function V(X,nt,bt){W.setFromMatrixPosition(nt.matrixWorld),$.setFromMatrixPosition(bt.matrixWorld);const gt=W.distanceTo($),Rt=nt.projectionMatrix.elements,Ut=bt.projectionMatrix.elements,Xt=Rt[14]/(Rt[10]-1),pe=Rt[14]/(Rt[10]+1),w=(Rt[9]+1)/Rt[5],zt=(Rt[9]-1)/Rt[5],Ft=(Rt[8]-1)/Rt[0],$t=(Ut[8]+1)/Ut[0],wt=Xt*Ft,me=Xt*$t,Lt=gt/(-Ft+$t),Dt=Lt*-Ft;if(nt.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(Dt),X.translateZ(Lt),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert(),Rt[10]===-1)X.projectionMatrix.copy(nt.projectionMatrix),X.projectionMatrixInverse.copy(nt.projectionMatrixInverse);else{const R=Xt+Lt,v=pe+Lt,H=wt-Dt,J=me+(gt-Dt),tt=w*pe/v*R,Q=zt*pe/v*R;X.projectionMatrix.makePerspective(H,J,tt,Q,R,v),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}}function ht(X,nt){nt===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(nt.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(s===null)return;let nt=X.near,bt=X.far;_.texture!==null&&(_.depthNear>0&&(nt=_.depthNear),_.depthFar>0&&(bt=_.depthFar)),x.near=P.near=E.near=nt,x.far=P.far=E.far=bt,(L!==x.near||B!==x.far)&&(s.updateRenderState({depthNear:x.near,depthFar:x.far}),L=x.near,B=x.far);const gt=X.parent,Rt=x.cameras;ht(x,gt);for(let Ut=0;Ut<Rt.length;Ut++)ht(Rt[Ut],gt);Rt.length===2?V(x,E,P):x.projectionMatrix.copy(E.projectionMatrix),ft(X,x,gt)};function ft(X,nt,bt){bt===null?X.matrix.copy(nt.matrixWorld):(X.matrix.copy(bt.matrixWorld),X.matrix.invert(),X.matrix.multiply(nt.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(nt.projectionMatrix),X.projectionMatrixInverse.copy(nt.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=Cl*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return x},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(X){l=X,d!==null&&(d.fixedFoveation=X),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=X)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(x)};let Mt=null;function kt(X,nt){if(u=nt.getViewerPose(c||o),g=nt,u!==null){const bt=u.views;f!==null&&(t.setRenderTargetFramebuffer(y,f.framebuffer),t.setRenderTarget(y));let gt=!1;bt.length!==x.cameras.length&&(x.cameras.length=0,gt=!0);for(let Ut=0;Ut<bt.length;Ut++){const Xt=bt[Ut];let pe=null;if(f!==null)pe=f.getViewport(Xt);else{const zt=h.getViewSubImage(d,Xt);pe=zt.viewport,Ut===0&&(t.setRenderTargetTextures(y,zt.colorTexture,d.ignoreDepthValues?void 0:zt.depthStencilTexture),t.setRenderTarget(y))}let w=b[Ut];w===void 0&&(w=new an,w.layers.enable(Ut),w.viewport=new Le,b[Ut]=w),w.matrix.fromArray(Xt.transform.matrix),w.matrix.decompose(w.position,w.quaternion,w.scale),w.projectionMatrix.fromArray(Xt.projectionMatrix),w.projectionMatrixInverse.copy(w.projectionMatrix).invert(),w.viewport.set(pe.x,pe.y,pe.width,pe.height),Ut===0&&(x.matrix.copy(w.matrix),x.matrix.decompose(x.position,x.quaternion,x.scale)),gt===!0&&x.cameras.push(w)}const Rt=s.enabledFeatures;if(Rt&&Rt.includes("depth-sensing")){const Ut=h.getDepthInformation(bt[0]);Ut&&Ut.isValid&&Ut.texture&&_.init(t,Ut,s.renderState)}}for(let bt=0;bt<M.length;bt++){const gt=A[bt],Rt=M[bt];gt!==null&&Rt!==void 0&&Rt.update(gt,nt,c||o)}Mt&&Mt(X,nt),nt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:nt}),g=null}const ee=new ad;ee.setAnimationLoop(kt),this.setAnimationLoop=function(X){Mt=X},this.dispose=function(){}}}const _i=new Gn,Yv=new fe;function qv(i,t){function e(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,id(i)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function s(p,m,y,M,A){m.isMeshBasicMaterial||m.isMeshLambertMaterial?r(p,m):m.isMeshToonMaterial?(r(p,m),h(p,m)):m.isMeshPhongMaterial?(r(p,m),u(p,m)):m.isMeshStandardMaterial?(r(p,m),d(p,m),m.isMeshPhysicalMaterial&&f(p,m,A)):m.isMeshMatcapMaterial?(r(p,m),g(p,m)):m.isMeshDepthMaterial?r(p,m):m.isMeshDistanceMaterial?(r(p,m),_(p,m)):m.isMeshNormalMaterial?r(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,y,M):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,e(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===je&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,e(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===je&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,e(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,e(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);const y=t.get(m),M=y.envMap,A=y.envMapRotation;M&&(p.envMap.value=M,_i.copy(A),_i.x*=-1,_i.y*=-1,_i.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(_i.y*=-1,_i.z*=-1),p.envMapRotation.value.setFromMatrix4(Yv.makeRotationFromEuler(_i)),p.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,y,M){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*y,p.scale.value=M*.5,m.map&&(p.map.value=m.map,e(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function u(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function h(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function d(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function f(p,m,y){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===je&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=y.texture,p.transmissionSamplerSize.value.set(y.width,y.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function _(p,m){const y=t.get(m).light;p.referencePosition.value.setFromMatrixPosition(y.matrixWorld),p.nearDistance.value=y.shadow.camera.near,p.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function $v(i,t,e,n){let s={},r={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,M){const A=M.program;n.uniformBlockBinding(y,A)}function c(y,M){let A=s[y.id];A===void 0&&(g(y),A=u(y),s[y.id]=A,y.addEventListener("dispose",p));const U=M.program;n.updateUBOMapping(y,U);const C=t.render.frame;r[y.id]!==C&&(d(y),r[y.id]=C)}function u(y){const M=h();y.__bindingPointIndex=M;const A=i.createBuffer(),U=y.__size,C=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,A),i.bufferData(i.UNIFORM_BUFFER,U,C),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,M,A),A}function h(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(y){const M=s[y.id],A=y.uniforms,U=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,M);for(let C=0,E=A.length;C<E;C++){const P=Array.isArray(A[C])?A[C]:[A[C]];for(let b=0,x=P.length;b<x;b++){const L=P[b];if(f(L,C,b,U)===!0){const B=L.__offset,G=Array.isArray(L.value)?L.value:[L.value];let j=0;for(let Y=0;Y<G.length;Y++){const W=G[Y],$=_(W);typeof W=="number"||typeof W=="boolean"?(L.__data[0]=W,i.bufferSubData(i.UNIFORM_BUFFER,B+j,L.__data)):W.isMatrix3?(L.__data[0]=W.elements[0],L.__data[1]=W.elements[1],L.__data[2]=W.elements[2],L.__data[3]=0,L.__data[4]=W.elements[3],L.__data[5]=W.elements[4],L.__data[6]=W.elements[5],L.__data[7]=0,L.__data[8]=W.elements[6],L.__data[9]=W.elements[7],L.__data[10]=W.elements[8],L.__data[11]=0):(W.toArray(L.__data,j),j+=$.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,B,L.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(y,M,A,U){const C=y.value,E=M+"_"+A;if(U[E]===void 0)return typeof C=="number"||typeof C=="boolean"?U[E]=C:U[E]=C.clone(),!0;{const P=U[E];if(typeof C=="number"||typeof C=="boolean"){if(P!==C)return U[E]=C,!0}else if(P.equals(C)===!1)return P.copy(C),!0}return!1}function g(y){const M=y.uniforms;let A=0;const U=16;for(let E=0,P=M.length;E<P;E++){const b=Array.isArray(M[E])?M[E]:[M[E]];for(let x=0,L=b.length;x<L;x++){const B=b[x],G=Array.isArray(B.value)?B.value:[B.value];for(let j=0,Y=G.length;j<Y;j++){const W=G[j],$=_(W),V=A%U,ht=V%$.boundary,ft=V+ht;A+=ht,ft!==0&&U-ft<$.storage&&(A+=U-ft),B.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),B.__offset=A,A+=$.storage}}}const C=A%U;return C>0&&(A+=U-C),y.__size=A,y.__cache={},this}function _(y){const M={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(M.boundary=4,M.storage=4):y.isVector2?(M.boundary=8,M.storage=8):y.isVector3||y.isColor?(M.boundary=16,M.storage=12):y.isVector4?(M.boundary=16,M.storage=16):y.isMatrix3?(M.boundary=48,M.storage=48):y.isMatrix4?(M.boundary=64,M.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),M}function p(y){const M=y.target;M.removeEventListener("dispose",p);const A=o.indexOf(M.__bindingPointIndex);o.splice(A,1),i.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function m(){for(const y in s)i.deleteBuffer(s[y]);o=[],s={},r={}}return{bind:l,update:c,dispose:m}}class Kv{constructor(t={}){const{canvas:e=Fp(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1}=t;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=o;const f=new Uint32Array(4),g=new Int32Array(4);let _=null,p=null;const m=[],y=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=on,this.toneMapping=ii,this.toneMappingExposure=1;const M=this;let A=!1,U=0,C=0,E=null,P=-1,b=null;const x=new Le,L=new Le;let B=null;const G=new Zt(0);let j=0,Y=e.width,W=e.height,$=1,V=null,ht=null;const ft=new Le(0,0,Y,W),Mt=new Le(0,0,Y,W);let kt=!1;const ee=new od;let X=!1,nt=!1;const bt=new fe,gt=new k,Rt=new Le,Ut={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Xt=!1;function pe(){return E===null?$:1}let w=n;function zt(S,D){return e.getContext(S,D)}try{const S={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${ql}`),e.addEventListener("webglcontextlost",q,!1),e.addEventListener("webglcontextrestored",Z,!1),e.addEventListener("webglcontextcreationerror",ct,!1),w===null){const D="webgl2";if(w=zt(D,S),w===null)throw zt(D)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(S){throw console.error("THREE.WebGLRenderer: "+S.message),S}let Ft,$t,wt,me,Lt,Dt,R,v,H,J,tt,Q,Ct,dt,xt,Ht,rt,vt,Jt,Ot,St,Bt,Yt,ge;function I(){Ft=new e0(w),Ft.init(),Bt=new Bv(w,Ft),$t=new $_(w,Ft,t,Bt),wt=new Ov(w),me=new s0(w),Lt=new bv,Dt=new Fv(w,Ft,wt,Lt,$t,Bt,me),R=new j_(M),v=new t0(M),H=new um(w),Yt=new Y_(w,H),J=new n0(w,H,me,Yt),tt=new o0(w,J,H,me),Jt=new r0(w,$t,Dt),Ht=new K_(Lt),Q=new Mv(M,R,v,Ft,$t,Yt,Ht),Ct=new qv(M,Lt),dt=new Ev,xt=new Lv(Ft),vt=new X_(M,R,v,wt,tt,d,l),rt=new Uv(M,tt,$t),ge=new $v(w,me,$t,wt),Ot=new q_(w,Ft,me),St=new i0(w,Ft,me),me.programs=Q.programs,M.capabilities=$t,M.extensions=Ft,M.properties=Lt,M.renderLists=dt,M.shadowMap=rt,M.state=wt,M.info=me}I();const ot=new Xv(M,w);this.xr=ot,this.getContext=function(){return w},this.getContextAttributes=function(){return w.getContextAttributes()},this.forceContextLoss=function(){const S=Ft.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){const S=Ft.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return $},this.setPixelRatio=function(S){S!==void 0&&($=S,this.setSize(Y,W,!1))},this.getSize=function(S){return S.set(Y,W)},this.setSize=function(S,D,F=!0){if(ot.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Y=S,W=D,e.width=Math.floor(S*$),e.height=Math.floor(D*$),F===!0&&(e.style.width=S+"px",e.style.height=D+"px"),this.setViewport(0,0,S,D)},this.getDrawingBufferSize=function(S){return S.set(Y*$,W*$).floor()},this.setDrawingBufferSize=function(S,D,F){Y=S,W=D,$=F,e.width=Math.floor(S*F),e.height=Math.floor(D*F),this.setViewport(0,0,S,D)},this.getCurrentViewport=function(S){return S.copy(x)},this.getViewport=function(S){return S.copy(ft)},this.setViewport=function(S,D,F,z){S.isVector4?ft.set(S.x,S.y,S.z,S.w):ft.set(S,D,F,z),wt.viewport(x.copy(ft).multiplyScalar($).round())},this.getScissor=function(S){return S.copy(Mt)},this.setScissor=function(S,D,F,z){S.isVector4?Mt.set(S.x,S.y,S.z,S.w):Mt.set(S,D,F,z),wt.scissor(L.copy(Mt).multiplyScalar($).round())},this.getScissorTest=function(){return kt},this.setScissorTest=function(S){wt.setScissorTest(kt=S)},this.setOpaqueSort=function(S){V=S},this.setTransparentSort=function(S){ht=S},this.getClearColor=function(S){return S.copy(vt.getClearColor())},this.setClearColor=function(){vt.setClearColor.apply(vt,arguments)},this.getClearAlpha=function(){return vt.getClearAlpha()},this.setClearAlpha=function(){vt.setClearAlpha.apply(vt,arguments)},this.clear=function(S=!0,D=!0,F=!0){let z=0;if(S){let O=!1;if(E!==null){const at=E.texture.format;O=at===tc||at===Ql||at===Jl}if(O){const at=E.texture.type,pt=at===Hn||at===Pi||at===er||at===_s||at===Kl||at===jl,yt=vt.getClearColor(),Et=vt.getClearAlpha(),It=yt.r,Nt=yt.g,At=yt.b;pt?(f[0]=It,f[1]=Nt,f[2]=At,f[3]=Et,w.clearBufferuiv(w.COLOR,0,f)):(g[0]=It,g[1]=Nt,g[2]=At,g[3]=Et,w.clearBufferiv(w.COLOR,0,g))}else z|=w.COLOR_BUFFER_BIT}D&&(z|=w.DEPTH_BUFFER_BIT),F&&(z|=w.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),w.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",q,!1),e.removeEventListener("webglcontextrestored",Z,!1),e.removeEventListener("webglcontextcreationerror",ct,!1),dt.dispose(),xt.dispose(),Lt.dispose(),R.dispose(),v.dispose(),tt.dispose(),Yt.dispose(),ge.dispose(),Q.dispose(),ot.dispose(),ot.removeEventListener("sessionstart",bn),ot.removeEventListener("sessionend",gc),hi.stop()};function q(S){S.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),A=!0}function Z(){console.log("THREE.WebGLRenderer: Context Restored."),A=!1;const S=me.autoReset,D=rt.enabled,F=rt.autoUpdate,z=rt.needsUpdate,O=rt.type;I(),me.autoReset=S,rt.enabled=D,rt.autoUpdate=F,rt.needsUpdate=z,rt.type=O}function ct(S){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function Pt(S){const D=S.target;D.removeEventListener("dispose",Pt),Qt(D)}function Qt(S){Me(S),Lt.remove(S)}function Me(S){const D=Lt.get(S).programs;D!==void 0&&(D.forEach(function(F){Q.releaseProgram(F)}),S.isShaderMaterial&&Q.releaseShaderCache(S))}this.renderBufferDirect=function(S,D,F,z,O,at){D===null&&(D=Ut);const pt=O.isMesh&&O.matrixWorld.determinant()<0,yt=lf(S,D,F,z,O);wt.setMaterial(z,pt);let Et=F.index,It=1;if(z.wireframe===!0){if(Et=J.getWireframeAttribute(F),Et===void 0)return;It=2}const Nt=F.drawRange,At=F.attributes.position;let ie=Nt.start*It,ve=(Nt.start+Nt.count)*It;at!==null&&(ie=Math.max(ie,at.start*It),ve=Math.min(ve,(at.start+at.count)*It)),Et!==null?(ie=Math.max(ie,0),ve=Math.min(ve,Et.count)):At!=null&&(ie=Math.max(ie,0),ve=Math.min(ve,At.count));const xe=ve-ie;if(xe<0||xe===1/0)return;Yt.setup(O,z,yt,F,Et);let Je,se=Ot;if(Et!==null&&(Je=H.get(Et),se=St,se.setIndex(Je)),O.isMesh)z.wireframe===!0?(wt.setLineWidth(z.wireframeLinewidth*pe()),se.setMode(w.LINES)):se.setMode(w.TRIANGLES);else if(O.isLine){let Tt=z.linewidth;Tt===void 0&&(Tt=1),wt.setLineWidth(Tt*pe()),O.isLineSegments?se.setMode(w.LINES):O.isLineLoop?se.setMode(w.LINE_LOOP):se.setMode(w.LINE_STRIP)}else O.isPoints?se.setMode(w.POINTS):O.isSprite&&se.setMode(w.TRIANGLES);if(O.isBatchedMesh)if(O._multiDrawInstances!==null)se.renderMultiDrawInstances(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount,O._multiDrawInstances);else if(Ft.get("WEBGL_multi_draw"))se.renderMultiDraw(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount);else{const Tt=O._multiDrawStarts,Ne=O._multiDrawCounts,re=O._multiDrawCount,dn=Et?H.get(Et).bytesPerElement:1,Ni=Lt.get(z).currentProgram.getUniforms();for(let Qe=0;Qe<re;Qe++)Ni.setValue(w,"_gl_DrawID",Qe),se.render(Tt[Qe]/dn,Ne[Qe])}else if(O.isInstancedMesh)se.renderInstances(ie,xe,O.count);else if(F.isInstancedBufferGeometry){const Tt=F._maxInstanceCount!==void 0?F._maxInstanceCount:1/0,Ne=Math.min(F.instanceCount,Tt);se.renderInstances(ie,xe,Ne)}else se.render(ie,xe)};function De(S,D,F){S.transparent===!0&&S.side===_n&&S.forceSinglePass===!1?(S.side=je,S.needsUpdate=!0,fr(S,D,F),S.side=ri,S.needsUpdate=!0,fr(S,D,F),S.side=_n):fr(S,D,F)}this.compile=function(S,D,F=null){F===null&&(F=S),p=xt.get(F),p.init(D),y.push(p),F.traverseVisible(function(O){O.isLight&&O.layers.test(D.layers)&&(p.pushLight(O),O.castShadow&&p.pushShadow(O))}),S!==F&&S.traverseVisible(function(O){O.isLight&&O.layers.test(D.layers)&&(p.pushLight(O),O.castShadow&&p.pushShadow(O))}),p.setupLights();const z=new Set;return S.traverse(function(O){const at=O.material;if(at)if(Array.isArray(at))for(let pt=0;pt<at.length;pt++){const yt=at[pt];De(yt,F,O),z.add(yt)}else De(at,F,O),z.add(at)}),y.pop(),p=null,z},this.compileAsync=function(S,D,F=null){const z=this.compile(S,D,F);return new Promise(O=>{function at(){if(z.forEach(function(pt){Lt.get(pt).currentProgram.isReady()&&z.delete(pt)}),z.size===0){O(S);return}setTimeout(at,10)}Ft.get("KHR_parallel_shader_compile")!==null?at():setTimeout(at,10)})};let ne=null;function Ln(S){ne&&ne(S)}function bn(){hi.stop()}function gc(){hi.start()}const hi=new ad;hi.setAnimationLoop(Ln),typeof self<"u"&&hi.setContext(self),this.setAnimationLoop=function(S){ne=S,ot.setAnimationLoop(S),S===null?hi.stop():hi.start()},ot.addEventListener("sessionstart",bn),ot.addEventListener("sessionend",gc),this.render=function(S,D){if(D!==void 0&&D.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(A===!0)return;if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),ot.enabled===!0&&ot.isPresenting===!0&&(ot.cameraAutoUpdate===!0&&ot.updateCamera(D),D=ot.getCamera()),S.isScene===!0&&S.onBeforeRender(M,S,D,E),p=xt.get(S,y.length),p.init(D),y.push(p),bt.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),ee.setFromProjectionMatrix(bt),nt=this.localClippingEnabled,X=Ht.init(this.clippingPlanes,nt),_=dt.get(S,m.length),_.init(),m.push(_),ot.enabled===!0&&ot.isPresenting===!0){const at=M.xr.getDepthSensingMesh();at!==null&&Xo(at,D,-1/0,M.sortObjects)}Xo(S,D,0,M.sortObjects),_.finish(),M.sortObjects===!0&&_.sort(V,ht),Xt=ot.enabled===!1||ot.isPresenting===!1||ot.hasDepthSensing()===!1,Xt&&vt.addToRenderList(_,S),this.info.render.frame++,X===!0&&Ht.beginShadows();const F=p.state.shadowsArray;rt.render(F,S,D),X===!0&&Ht.endShadows(),this.info.autoReset===!0&&this.info.reset();const z=_.opaque,O=_.transmissive;if(p.setupLights(),D.isArrayCamera){const at=D.cameras;if(O.length>0)for(let pt=0,yt=at.length;pt<yt;pt++){const Et=at[pt];vc(z,O,S,Et)}Xt&&vt.render(S);for(let pt=0,yt=at.length;pt<yt;pt++){const Et=at[pt];_c(_,S,Et,Et.viewport)}}else O.length>0&&vc(z,O,S,D),Xt&&vt.render(S),_c(_,S,D);E!==null&&(Dt.updateMultisampleRenderTarget(E),Dt.updateRenderTargetMipmap(E)),S.isScene===!0&&S.onAfterRender(M,S,D),Yt.resetDefaultState(),P=-1,b=null,y.pop(),y.length>0?(p=y[y.length-1],X===!0&&Ht.setGlobalState(M.clippingPlanes,p.state.camera)):p=null,m.pop(),m.length>0?_=m[m.length-1]:_=null};function Xo(S,D,F,z){if(S.visible===!1)return;if(S.layers.test(D.layers)){if(S.isGroup)F=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(D);else if(S.isLight)p.pushLight(S),S.castShadow&&p.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||ee.intersectsSprite(S)){z&&Rt.setFromMatrixPosition(S.matrixWorld).applyMatrix4(bt);const pt=tt.update(S),yt=S.material;yt.visible&&_.push(S,pt,yt,F,Rt.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||ee.intersectsObject(S))){const pt=tt.update(S),yt=S.material;if(z&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),Rt.copy(S.boundingSphere.center)):(pt.boundingSphere===null&&pt.computeBoundingSphere(),Rt.copy(pt.boundingSphere.center)),Rt.applyMatrix4(S.matrixWorld).applyMatrix4(bt)),Array.isArray(yt)){const Et=pt.groups;for(let It=0,Nt=Et.length;It<Nt;It++){const At=Et[It],ie=yt[At.materialIndex];ie&&ie.visible&&_.push(S,pt,ie,F,Rt.z,At)}}else yt.visible&&_.push(S,pt,yt,F,Rt.z,null)}}const at=S.children;for(let pt=0,yt=at.length;pt<yt;pt++)Xo(at[pt],D,F,z)}function _c(S,D,F,z){const O=S.opaque,at=S.transmissive,pt=S.transparent;p.setupLightsView(F),X===!0&&Ht.setGlobalState(M.clippingPlanes,F),z&&wt.viewport(x.copy(z)),O.length>0&&dr(O,D,F),at.length>0&&dr(at,D,F),pt.length>0&&dr(pt,D,F),wt.buffers.depth.setTest(!0),wt.buffers.depth.setMask(!0),wt.buffers.color.setMask(!0),wt.setPolygonOffset(!1)}function vc(S,D,F,z){if((F.isScene===!0?F.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[z.id]===void 0&&(p.state.transmissionRenderTarget[z.id]=new Ii(1,1,{generateMipmaps:!0,type:Ft.has("EXT_color_buffer_half_float")||Ft.has("EXT_color_buffer_float")?ar:Hn,minFilter:Ti,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:oe.workingColorSpace}));const at=p.state.transmissionRenderTarget[z.id],pt=z.viewport||x;at.setSize(pt.z,pt.w);const yt=M.getRenderTarget();M.setRenderTarget(at),M.getClearColor(G),j=M.getClearAlpha(),j<1&&M.setClearColor(16777215,.5),M.clear(),Xt&&vt.render(F);const Et=M.toneMapping;M.toneMapping=ii;const It=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),p.setupLightsView(z),X===!0&&Ht.setGlobalState(M.clippingPlanes,z),dr(S,F,z),Dt.updateMultisampleRenderTarget(at),Dt.updateRenderTargetMipmap(at),Ft.has("WEBGL_multisampled_render_to_texture")===!1){let Nt=!1;for(let At=0,ie=D.length;At<ie;At++){const ve=D[At],xe=ve.object,Je=ve.geometry,se=ve.material,Tt=ve.group;if(se.side===_n&&xe.layers.test(z.layers)){const Ne=se.side;se.side=je,se.needsUpdate=!0,xc(xe,F,z,Je,se,Tt),se.side=Ne,se.needsUpdate=!0,Nt=!0}}Nt===!0&&(Dt.updateMultisampleRenderTarget(at),Dt.updateRenderTargetMipmap(at))}M.setRenderTarget(yt),M.setClearColor(G,j),It!==void 0&&(z.viewport=It),M.toneMapping=Et}function dr(S,D,F){const z=D.isScene===!0?D.overrideMaterial:null;for(let O=0,at=S.length;O<at;O++){const pt=S[O],yt=pt.object,Et=pt.geometry,It=z===null?pt.material:z,Nt=pt.group;yt.layers.test(F.layers)&&xc(yt,D,F,Et,It,Nt)}}function xc(S,D,F,z,O,at){S.onBeforeRender(M,D,F,z,O,at),S.modelViewMatrix.multiplyMatrices(F.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),O.onBeforeRender(M,D,F,z,S,at),O.transparent===!0&&O.side===_n&&O.forceSinglePass===!1?(O.side=je,O.needsUpdate=!0,M.renderBufferDirect(F,D,z,O,S,at),O.side=ri,O.needsUpdate=!0,M.renderBufferDirect(F,D,z,O,S,at),O.side=_n):M.renderBufferDirect(F,D,z,O,S,at),S.onAfterRender(M,D,F,z,O,at)}function fr(S,D,F){D.isScene!==!0&&(D=Ut);const z=Lt.get(S),O=p.state.lights,at=p.state.shadowsArray,pt=O.state.version,yt=Q.getParameters(S,O.state,at,D,F),Et=Q.getProgramCacheKey(yt);let It=z.programs;z.environment=S.isMeshStandardMaterial?D.environment:null,z.fog=D.fog,z.envMap=(S.isMeshStandardMaterial?v:R).get(S.envMap||z.environment),z.envMapRotation=z.environment!==null&&S.envMap===null?D.environmentRotation:S.envMapRotation,It===void 0&&(S.addEventListener("dispose",Pt),It=new Map,z.programs=It);let Nt=It.get(Et);if(Nt!==void 0){if(z.currentProgram===Nt&&z.lightsStateVersion===pt)return Mc(S,yt),Nt}else yt.uniforms=Q.getUniforms(S),S.onBeforeCompile(yt,M),Nt=Q.acquireProgram(yt,Et),It.set(Et,Nt),z.uniforms=yt.uniforms;const At=z.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(At.clippingPlanes=Ht.uniform),Mc(S,yt),z.needsLights=uf(S),z.lightsStateVersion=pt,z.needsLights&&(At.ambientLightColor.value=O.state.ambient,At.lightProbe.value=O.state.probe,At.directionalLights.value=O.state.directional,At.directionalLightShadows.value=O.state.directionalShadow,At.spotLights.value=O.state.spot,At.spotLightShadows.value=O.state.spotShadow,At.rectAreaLights.value=O.state.rectArea,At.ltc_1.value=O.state.rectAreaLTC1,At.ltc_2.value=O.state.rectAreaLTC2,At.pointLights.value=O.state.point,At.pointLightShadows.value=O.state.pointShadow,At.hemisphereLights.value=O.state.hemi,At.directionalShadowMap.value=O.state.directionalShadowMap,At.directionalShadowMatrix.value=O.state.directionalShadowMatrix,At.spotShadowMap.value=O.state.spotShadowMap,At.spotLightMatrix.value=O.state.spotLightMatrix,At.spotLightMap.value=O.state.spotLightMap,At.pointShadowMap.value=O.state.pointShadowMap,At.pointShadowMatrix.value=O.state.pointShadowMatrix),z.currentProgram=Nt,z.uniformsList=null,Nt}function Sc(S){if(S.uniformsList===null){const D=S.currentProgram.getUniforms();S.uniformsList=ao.seqWithValue(D.seq,S.uniforms)}return S.uniformsList}function Mc(S,D){const F=Lt.get(S);F.outputColorSpace=D.outputColorSpace,F.batching=D.batching,F.batchingColor=D.batchingColor,F.instancing=D.instancing,F.instancingColor=D.instancingColor,F.instancingMorph=D.instancingMorph,F.skinning=D.skinning,F.morphTargets=D.morphTargets,F.morphNormals=D.morphNormals,F.morphColors=D.morphColors,F.morphTargetsCount=D.morphTargetsCount,F.numClippingPlanes=D.numClippingPlanes,F.numIntersection=D.numClipIntersection,F.vertexAlphas=D.vertexAlphas,F.vertexTangents=D.vertexTangents,F.toneMapping=D.toneMapping}function lf(S,D,F,z,O){D.isScene!==!0&&(D=Ut),Dt.resetTextureUnits();const at=D.fog,pt=z.isMeshStandardMaterial?D.environment:null,yt=E===null?M.outputColorSpace:E.isXRRenderTarget===!0?E.texture.colorSpace:ai,Et=(z.isMeshStandardMaterial?v:R).get(z.envMap||pt),It=z.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,Nt=!!F.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),At=!!F.morphAttributes.position,ie=!!F.morphAttributes.normal,ve=!!F.morphAttributes.color;let xe=ii;z.toneMapped&&(E===null||E.isXRRenderTarget===!0)&&(xe=M.toneMapping);const Je=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,se=Je!==void 0?Je.length:0,Tt=Lt.get(z),Ne=p.state.lights;if(X===!0&&(nt===!0||S!==b)){const sn=S===b&&z.id===P;Ht.setState(z,S,sn)}let re=!1;z.version===Tt.__version?(Tt.needsLights&&Tt.lightsStateVersion!==Ne.state.version||Tt.outputColorSpace!==yt||O.isBatchedMesh&&Tt.batching===!1||!O.isBatchedMesh&&Tt.batching===!0||O.isBatchedMesh&&Tt.batchingColor===!0&&O.colorTexture===null||O.isBatchedMesh&&Tt.batchingColor===!1&&O.colorTexture!==null||O.isInstancedMesh&&Tt.instancing===!1||!O.isInstancedMesh&&Tt.instancing===!0||O.isSkinnedMesh&&Tt.skinning===!1||!O.isSkinnedMesh&&Tt.skinning===!0||O.isInstancedMesh&&Tt.instancingColor===!0&&O.instanceColor===null||O.isInstancedMesh&&Tt.instancingColor===!1&&O.instanceColor!==null||O.isInstancedMesh&&Tt.instancingMorph===!0&&O.morphTexture===null||O.isInstancedMesh&&Tt.instancingMorph===!1&&O.morphTexture!==null||Tt.envMap!==Et||z.fog===!0&&Tt.fog!==at||Tt.numClippingPlanes!==void 0&&(Tt.numClippingPlanes!==Ht.numPlanes||Tt.numIntersection!==Ht.numIntersection)||Tt.vertexAlphas!==It||Tt.vertexTangents!==Nt||Tt.morphTargets!==At||Tt.morphNormals!==ie||Tt.morphColors!==ve||Tt.toneMapping!==xe||Tt.morphTargetsCount!==se)&&(re=!0):(re=!0,Tt.__version=z.version);let dn=Tt.currentProgram;re===!0&&(dn=fr(z,D,O));let Ni=!1,Qe=!1,Yo=!1;const be=dn.getUniforms(),Vn=Tt.uniforms;if(wt.useProgram(dn.program)&&(Ni=!0,Qe=!0,Yo=!0),z.id!==P&&(P=z.id,Qe=!0),Ni||b!==S){be.setValue(w,"projectionMatrix",S.projectionMatrix),be.setValue(w,"viewMatrix",S.matrixWorldInverse);const sn=be.map.cameraPosition;sn!==void 0&&sn.setValue(w,gt.setFromMatrixPosition(S.matrixWorld)),$t.logarithmicDepthBuffer&&be.setValue(w,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&be.setValue(w,"isOrthographic",S.isOrthographicCamera===!0),b!==S&&(b=S,Qe=!0,Yo=!0)}if(O.isSkinnedMesh){be.setOptional(w,O,"bindMatrix"),be.setOptional(w,O,"bindMatrixInverse");const sn=O.skeleton;sn&&(sn.boneTexture===null&&sn.computeBoneTexture(),be.setValue(w,"boneTexture",sn.boneTexture,Dt))}O.isBatchedMesh&&(be.setOptional(w,O,"batchingTexture"),be.setValue(w,"batchingTexture",O._matricesTexture,Dt),be.setOptional(w,O,"batchingIdTexture"),be.setValue(w,"batchingIdTexture",O._indirectTexture,Dt),be.setOptional(w,O,"batchingColorTexture"),O._colorsTexture!==null&&be.setValue(w,"batchingColorTexture",O._colorsTexture,Dt));const qo=F.morphAttributes;if((qo.position!==void 0||qo.normal!==void 0||qo.color!==void 0)&&Jt.update(O,F,dn),(Qe||Tt.receiveShadow!==O.receiveShadow)&&(Tt.receiveShadow=O.receiveShadow,be.setValue(w,"receiveShadow",O.receiveShadow)),z.isMeshGouraudMaterial&&z.envMap!==null&&(Vn.envMap.value=Et,Vn.flipEnvMap.value=Et.isCubeTexture&&Et.isRenderTargetTexture===!1?-1:1),z.isMeshStandardMaterial&&z.envMap===null&&D.environment!==null&&(Vn.envMapIntensity.value=D.environmentIntensity),Qe&&(be.setValue(w,"toneMappingExposure",M.toneMappingExposure),Tt.needsLights&&cf(Vn,Yo),at&&z.fog===!0&&Ct.refreshFogUniforms(Vn,at),Ct.refreshMaterialUniforms(Vn,z,$,W,p.state.transmissionRenderTarget[S.id]),ao.upload(w,Sc(Tt),Vn,Dt)),z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(ao.upload(w,Sc(Tt),Vn,Dt),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&be.setValue(w,"center",O.center),be.setValue(w,"modelViewMatrix",O.modelViewMatrix),be.setValue(w,"normalMatrix",O.normalMatrix),be.setValue(w,"modelMatrix",O.matrixWorld),z.isShaderMaterial||z.isRawShaderMaterial){const sn=z.uniformsGroups;for(let $o=0,hf=sn.length;$o<hf;$o++){const bc=sn[$o];ge.update(bc,dn),ge.bind(bc,dn)}}return dn}function cf(S,D){S.ambientLightColor.needsUpdate=D,S.lightProbe.needsUpdate=D,S.directionalLights.needsUpdate=D,S.directionalLightShadows.needsUpdate=D,S.pointLights.needsUpdate=D,S.pointLightShadows.needsUpdate=D,S.spotLights.needsUpdate=D,S.spotLightShadows.needsUpdate=D,S.rectAreaLights.needsUpdate=D,S.hemisphereLights.needsUpdate=D}function uf(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return U},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return E},this.setRenderTargetTextures=function(S,D,F){Lt.get(S.texture).__webglTexture=D,Lt.get(S.depthTexture).__webglTexture=F;const z=Lt.get(S);z.__hasExternalTextures=!0,z.__autoAllocateDepthBuffer=F===void 0,z.__autoAllocateDepthBuffer||Ft.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),z.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(S,D){const F=Lt.get(S);F.__webglFramebuffer=D,F.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(S,D=0,F=0){E=S,U=D,C=F;let z=!0,O=null,at=!1,pt=!1;if(S){const Et=Lt.get(S);if(Et.__useDefaultFramebuffer!==void 0)wt.bindFramebuffer(w.FRAMEBUFFER,null),z=!1;else if(Et.__webglFramebuffer===void 0)Dt.setupRenderTarget(S);else if(Et.__hasExternalTextures)Dt.rebindTextures(S,Lt.get(S.texture).__webglTexture,Lt.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){const At=S.depthTexture;if(Et.__boundDepthTexture!==At){if(At!==null&&Lt.has(At)&&(S.width!==At.image.width||S.height!==At.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Dt.setupDepthRenderbuffer(S)}}const It=S.texture;(It.isData3DTexture||It.isDataArrayTexture||It.isCompressedArrayTexture)&&(pt=!0);const Nt=Lt.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Nt[D])?O=Nt[D][F]:O=Nt[D],at=!0):S.samples>0&&Dt.useMultisampledRTT(S)===!1?O=Lt.get(S).__webglMultisampledFramebuffer:Array.isArray(Nt)?O=Nt[F]:O=Nt,x.copy(S.viewport),L.copy(S.scissor),B=S.scissorTest}else x.copy(ft).multiplyScalar($).floor(),L.copy(Mt).multiplyScalar($).floor(),B=kt;if(wt.bindFramebuffer(w.FRAMEBUFFER,O)&&z&&wt.drawBuffers(S,O),wt.viewport(x),wt.scissor(L),wt.setScissorTest(B),at){const Et=Lt.get(S.texture);w.framebufferTexture2D(w.FRAMEBUFFER,w.COLOR_ATTACHMENT0,w.TEXTURE_CUBE_MAP_POSITIVE_X+D,Et.__webglTexture,F)}else if(pt){const Et=Lt.get(S.texture),It=D||0;w.framebufferTextureLayer(w.FRAMEBUFFER,w.COLOR_ATTACHMENT0,Et.__webglTexture,F||0,It)}P=-1},this.readRenderTargetPixels=function(S,D,F,z,O,at,pt){if(!(S&&S.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let yt=Lt.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&pt!==void 0&&(yt=yt[pt]),yt){wt.bindFramebuffer(w.FRAMEBUFFER,yt);try{const Et=S.texture,It=Et.format,Nt=Et.type;if(!$t.textureFormatReadable(It)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!$t.textureTypeReadable(Nt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=S.width-z&&F>=0&&F<=S.height-O&&w.readPixels(D,F,z,O,Bt.convert(It),Bt.convert(Nt),at)}finally{const Et=E!==null?Lt.get(E).__webglFramebuffer:null;wt.bindFramebuffer(w.FRAMEBUFFER,Et)}}},this.readRenderTargetPixelsAsync=async function(S,D,F,z,O,at,pt){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let yt=Lt.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&pt!==void 0&&(yt=yt[pt]),yt){wt.bindFramebuffer(w.FRAMEBUFFER,yt);try{const Et=S.texture,It=Et.format,Nt=Et.type;if(!$t.textureFormatReadable(It))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!$t.textureTypeReadable(Nt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(D>=0&&D<=S.width-z&&F>=0&&F<=S.height-O){const At=w.createBuffer();w.bindBuffer(w.PIXEL_PACK_BUFFER,At),w.bufferData(w.PIXEL_PACK_BUFFER,at.byteLength,w.STREAM_READ),w.readPixels(D,F,z,O,Bt.convert(It),Bt.convert(Nt),0),w.flush();const ie=w.fenceSync(w.SYNC_GPU_COMMANDS_COMPLETE,0);await Bp(w,ie,4);try{w.bindBuffer(w.PIXEL_PACK_BUFFER,At),w.getBufferSubData(w.PIXEL_PACK_BUFFER,0,at)}finally{w.deleteBuffer(At),w.deleteSync(ie)}return at}}finally{const Et=E!==null?Lt.get(E).__webglFramebuffer:null;wt.bindFramebuffer(w.FRAMEBUFFER,Et)}}},this.copyFramebufferToTexture=function(S,D=null,F=0){S.isTexture!==!0&&(hs("WebGLRenderer: copyFramebufferToTexture function signature has changed."),D=arguments[0]||null,S=arguments[1]);const z=Math.pow(2,-F),O=Math.floor(S.image.width*z),at=Math.floor(S.image.height*z),pt=D!==null?D.x:0,yt=D!==null?D.y:0;Dt.setTexture2D(S,0),w.copyTexSubImage2D(w.TEXTURE_2D,F,0,0,pt,yt,O,at),wt.unbindTexture()},this.copyTextureToTexture=function(S,D,F=null,z=null,O=0){S.isTexture!==!0&&(hs("WebGLRenderer: copyTextureToTexture function signature has changed."),z=arguments[0]||null,S=arguments[1],D=arguments[2],O=arguments[3]||0,F=null);let at,pt,yt,Et,It,Nt;F!==null?(at=F.max.x-F.min.x,pt=F.max.y-F.min.y,yt=F.min.x,Et=F.min.y):(at=S.image.width,pt=S.image.height,yt=0,Et=0),z!==null?(It=z.x,Nt=z.y):(It=0,Nt=0);const At=Bt.convert(D.format),ie=Bt.convert(D.type);Dt.setTexture2D(D,0),w.pixelStorei(w.UNPACK_FLIP_Y_WEBGL,D.flipY),w.pixelStorei(w.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),w.pixelStorei(w.UNPACK_ALIGNMENT,D.unpackAlignment);const ve=w.getParameter(w.UNPACK_ROW_LENGTH),xe=w.getParameter(w.UNPACK_IMAGE_HEIGHT),Je=w.getParameter(w.UNPACK_SKIP_PIXELS),se=w.getParameter(w.UNPACK_SKIP_ROWS),Tt=w.getParameter(w.UNPACK_SKIP_IMAGES),Ne=S.isCompressedTexture?S.mipmaps[O]:S.image;w.pixelStorei(w.UNPACK_ROW_LENGTH,Ne.width),w.pixelStorei(w.UNPACK_IMAGE_HEIGHT,Ne.height),w.pixelStorei(w.UNPACK_SKIP_PIXELS,yt),w.pixelStorei(w.UNPACK_SKIP_ROWS,Et),S.isDataTexture?w.texSubImage2D(w.TEXTURE_2D,O,It,Nt,at,pt,At,ie,Ne.data):S.isCompressedTexture?w.compressedTexSubImage2D(w.TEXTURE_2D,O,It,Nt,Ne.width,Ne.height,At,Ne.data):w.texSubImage2D(w.TEXTURE_2D,O,It,Nt,at,pt,At,ie,Ne),w.pixelStorei(w.UNPACK_ROW_LENGTH,ve),w.pixelStorei(w.UNPACK_IMAGE_HEIGHT,xe),w.pixelStorei(w.UNPACK_SKIP_PIXELS,Je),w.pixelStorei(w.UNPACK_SKIP_ROWS,se),w.pixelStorei(w.UNPACK_SKIP_IMAGES,Tt),O===0&&D.generateMipmaps&&w.generateMipmap(w.TEXTURE_2D),wt.unbindTexture()},this.copyTextureToTexture3D=function(S,D,F=null,z=null,O=0){S.isTexture!==!0&&(hs("WebGLRenderer: copyTextureToTexture3D function signature has changed."),F=arguments[0]||null,z=arguments[1]||null,S=arguments[2],D=arguments[3],O=arguments[4]||0);let at,pt,yt,Et,It,Nt,At,ie,ve;const xe=S.isCompressedTexture?S.mipmaps[O]:S.image;F!==null?(at=F.max.x-F.min.x,pt=F.max.y-F.min.y,yt=F.max.z-F.min.z,Et=F.min.x,It=F.min.y,Nt=F.min.z):(at=xe.width,pt=xe.height,yt=xe.depth,Et=0,It=0,Nt=0),z!==null?(At=z.x,ie=z.y,ve=z.z):(At=0,ie=0,ve=0);const Je=Bt.convert(D.format),se=Bt.convert(D.type);let Tt;if(D.isData3DTexture)Dt.setTexture3D(D,0),Tt=w.TEXTURE_3D;else if(D.isDataArrayTexture||D.isCompressedArrayTexture)Dt.setTexture2DArray(D,0),Tt=w.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}w.pixelStorei(w.UNPACK_FLIP_Y_WEBGL,D.flipY),w.pixelStorei(w.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),w.pixelStorei(w.UNPACK_ALIGNMENT,D.unpackAlignment);const Ne=w.getParameter(w.UNPACK_ROW_LENGTH),re=w.getParameter(w.UNPACK_IMAGE_HEIGHT),dn=w.getParameter(w.UNPACK_SKIP_PIXELS),Ni=w.getParameter(w.UNPACK_SKIP_ROWS),Qe=w.getParameter(w.UNPACK_SKIP_IMAGES);w.pixelStorei(w.UNPACK_ROW_LENGTH,xe.width),w.pixelStorei(w.UNPACK_IMAGE_HEIGHT,xe.height),w.pixelStorei(w.UNPACK_SKIP_PIXELS,Et),w.pixelStorei(w.UNPACK_SKIP_ROWS,It),w.pixelStorei(w.UNPACK_SKIP_IMAGES,Nt),S.isDataTexture||S.isData3DTexture?w.texSubImage3D(Tt,O,At,ie,ve,at,pt,yt,Je,se,xe.data):D.isCompressedArrayTexture?w.compressedTexSubImage3D(Tt,O,At,ie,ve,at,pt,yt,Je,xe.data):w.texSubImage3D(Tt,O,At,ie,ve,at,pt,yt,Je,se,xe),w.pixelStorei(w.UNPACK_ROW_LENGTH,Ne),w.pixelStorei(w.UNPACK_IMAGE_HEIGHT,re),w.pixelStorei(w.UNPACK_SKIP_PIXELS,dn),w.pixelStorei(w.UNPACK_SKIP_ROWS,Ni),w.pixelStorei(w.UNPACK_SKIP_IMAGES,Qe),O===0&&D.generateMipmaps&&w.generateMipmap(Tt),wt.unbindTexture()},this.initRenderTarget=function(S){Lt.get(S).__webglFramebuffer===void 0&&Dt.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?Dt.setTextureCube(S,0):S.isData3DTexture?Dt.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?Dt.setTexture2DArray(S,0):Dt.setTexture2D(S,0),wt.unbindTexture()},this.resetState=function(){U=0,C=0,E=null,wt.reset(),Yt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Bn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=t===ec?"display-p3":"srgb",e.unpackColorSpace=oe.workingColorSpace===Oo?"display-p3":"srgb"}}class jv extends ze{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Gn,this.environmentIntensity=1,this.environmentRotation=new Gn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class Zv{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=Rl,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=si()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}get updateRange(){return hs("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=si()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=si()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const He=new k;class _o{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)He.fromBufferAttribute(this,e),He.applyMatrix4(t),this.setXYZ(e,He.x,He.y,He.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)He.fromBufferAttribute(this,e),He.applyNormalMatrix(t),this.setXYZ(e,He.x,He.y,He.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)He.fromBufferAttribute(this,e),He.transformDirection(t),this.setXYZ(e,He.x,He.y,He.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=An(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=le(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=le(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=le(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=le(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=le(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=An(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=An(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=An(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=An(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=le(e,this.array),n=le(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=le(e,this.array),n=le(n,this.array),s=le(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=le(e,this.array),n=le(n,this.array),s=le(s,this.array),r=le(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new Ae(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new _o(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class fd extends As{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Zt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let Ji;const Us=new k,Qi=new k,ts=new k,es=new Kt,Os=new Kt,pd=new fe,kr=new k,ks=new k,Fr=new k,wu=new Kt,ya=new Kt,Au=new Kt;class Jv extends ze{constructor(t=new fd){if(super(),this.isSprite=!0,this.type="Sprite",Ji===void 0){Ji=new Mn;const e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Zv(e,5);Ji.setIndex([0,1,2,0,2,3]),Ji.setAttribute("position",new _o(n,3,0,!1)),Ji.setAttribute("uv",new _o(n,2,3,!1))}this.geometry=Ji,this.material=t,this.center=new Kt(.5,.5)}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Qi.setFromMatrixScale(this.matrixWorld),pd.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),ts.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Qi.multiplyScalar(-ts.z);const n=this.material.rotation;let s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));const o=this.center;Br(kr.set(-.5,-.5,0),ts,o,Qi,s,r),Br(ks.set(.5,-.5,0),ts,o,Qi,s,r),Br(Fr.set(.5,.5,0),ts,o,Qi,s,r),wu.set(0,0),ya.set(1,0),Au.set(1,1);let a=t.ray.intersectTriangle(kr,ks,Fr,!1,Us);if(a===null&&(Br(ks.set(-.5,.5,0),ts,o,Qi,s,r),ya.set(0,1),a=t.ray.intersectTriangle(kr,Fr,ks,!1,Us),a===null))return;const l=t.ray.origin.distanceTo(Us);l<t.near||l>t.far||e.push({distance:l,point:Us.clone(),uv:ln.getInterpolation(Us,kr,ks,Fr,wu,ya,Au,new Kt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}}function Br(i,t,e,n,s,r){es.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(Os.x=r*es.x-s*es.y,Os.y=s*es.x+r*es.y):Os.copy(es),i.copy(t),i.x+=Os.x,i.y+=Os.y,i.applyMatrix4(pd)}class Qv extends Be{constructor(t=null,e=1,n=1,s,r,o,a,l,c=we,u=we,h,d){super(null,o,a,l,c,u,s,r,h,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Tu extends Ae{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const ns=new fe,Ru=new fe,zr=[],Cu=new Di,tx=new fe,Fs=new Ke,Bs=new ws;class ex extends Ke{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Tu(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,tx)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Di),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,ns),Cu.copy(t.boundingBox).applyMatrix4(ns),this.boundingBox.union(Cu)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new ws),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,ns),Bs.copy(t.boundingSphere).applyMatrix4(ns),this.boundingSphere.union(Bs)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(t,e){const n=this.matrixWorld,s=this.count;if(Fs.geometry=this.geometry,Fs.material=this.material,Fs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Bs.copy(this.boundingSphere),Bs.applyMatrix4(n),t.ray.intersectsSphere(Bs)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,ns),Ru.multiplyMatrices(n,ns),Fs.matrixWorld=Ru,Fs.raycast(t,zr);for(let o=0,a=zr.length;o<a;o++){const l=zr[o];l.instanceId=r,l.object=this,e.push(l)}zr.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new Tu(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Qv(new Float32Array(s*this.count),s,this.count,Zl,Tn));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=s*t;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class md extends As{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Zt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const vo=new k,xo=new k,Lu=new fe,zs=new Jh,Hr=new ws,Ea=new k,Pu=new k;class nx extends ze{constructor(t=new Mn,e=new md){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)vo.fromBufferAttribute(e,s-1),xo.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=vo.distanceTo(xo);t.setAttribute("lineDistance",new Rn(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Hr.copy(n.boundingSphere),Hr.applyMatrix4(s),Hr.radius+=r,t.ray.intersectsSphere(Hr)===!1)return;Lu.copy(s).invert(),zs.copy(t.ray).applyMatrix4(Lu);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){const f=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let _=f,p=g-1;_<p;_+=c){const m=u.getX(_),y=u.getX(_+1),M=Gr(this,t,zs,l,m,y);M&&e.push(M)}if(this.isLineLoop){const _=u.getX(g-1),p=u.getX(f),m=Gr(this,t,zs,l,_,p);m&&e.push(m)}}else{const f=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let _=f,p=g-1;_<p;_+=c){const m=Gr(this,t,zs,l,_,_+1);m&&e.push(m)}if(this.isLineLoop){const _=Gr(this,t,zs,l,g-1,f);_&&e.push(_)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Gr(i,t,e,n,s,r){const o=i.geometry.attributes.position;if(vo.fromBufferAttribute(o,s),xo.fromBufferAttribute(o,r),e.distanceSqToSegment(vo,xo,Ea,Pu)>n)return;Ea.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(Ea);if(!(l<t.near||l>t.far))return{distance:l,point:Pu.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,object:i}}const Iu=new k,Du=new k;class ix extends nx{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)Iu.fromBufferAttribute(e,s),Du.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Iu.distanceTo(Du);t.setAttribute("lineDistance",new Rn(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class ic extends Be{constructor(t,e,n,s,r,o,a,l,c){super(t,e,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}const Vr=new k,Wr=new k,wa=new k,Xr=new ln;class sx extends Mn{constructor(t=null,e=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:t,thresholdAngle:e},t!==null){const s=Math.pow(10,4),r=Math.cos(oo*e),o=t.getIndex(),a=t.getAttribute("position"),l=o?o.count:a.count,c=[0,0,0],u=["a","b","c"],h=new Array(3),d={},f=[];for(let g=0;g<l;g+=3){o?(c[0]=o.getX(g),c[1]=o.getX(g+1),c[2]=o.getX(g+2)):(c[0]=g,c[1]=g+1,c[2]=g+2);const{a:_,b:p,c:m}=Xr;if(_.fromBufferAttribute(a,c[0]),p.fromBufferAttribute(a,c[1]),m.fromBufferAttribute(a,c[2]),Xr.getNormal(wa),h[0]=`${Math.round(_.x*s)},${Math.round(_.y*s)},${Math.round(_.z*s)}`,h[1]=`${Math.round(p.x*s)},${Math.round(p.y*s)},${Math.round(p.z*s)}`,h[2]=`${Math.round(m.x*s)},${Math.round(m.y*s)},${Math.round(m.z*s)}`,!(h[0]===h[1]||h[1]===h[2]||h[2]===h[0]))for(let y=0;y<3;y++){const M=(y+1)%3,A=h[y],U=h[M],C=Xr[u[y]],E=Xr[u[M]],P=`${A}_${U}`,b=`${U}_${A}`;b in d&&d[b]?(wa.dot(d[b].normal)<=r&&(f.push(C.x,C.y,C.z),f.push(E.x,E.y,E.z)),d[b]=null):P in d||(d[P]={index0:c[y],index1:c[M],normal:wa.clone()})}}for(const g in d)if(d[g]){const{index0:_,index1:p}=d[g];Vr.fromBufferAttribute(a,_),Wr.fromBufferAttribute(a,p),f.push(Vr.x,Vr.y,Vr.z),f.push(Wr.x,Wr.y,Wr.z)}this.setAttribute("position",new Rn(f,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:ql}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=ql);const cn=new Map;function un(i,t,e={}){const n={id:i,kind:t,blockId:e.blockId??-1,stackSize:e.stackSize??64,...e};return cn.set(i,n),n}for(const i of No)i&&(Yl.has(i.name)||un(i.name,"block",{blockId:i.id,stackSize:i.stackSize}));const gd=["stick","coal","charcoal","raw_ferrite","ferrite_ingot","raw_copper","copper_ingot","raw_aurum","aurum_ingot","aetherite_gem","ember_dust","clay_ball","brick","stone_shard","string","leather","feather","bone","wheat","seeds","cobbled_understone"];for(const i of gd)un(i,"material",{fuelSeconds:i==="coal"||i==="charcoal"?80:i==="stick"?5:void 0});const _d=[{id:"apple",hunger:4,saturation:2.4},{id:"bread",hunger:6,saturation:3.6},{id:"dewberry",hunger:2,saturation:1.2},{id:"raw_meat",hunger:3,saturation:1.2},{id:"cooked_meat",hunger:8,saturation:6.4}];for(const i of _d)un(i.id,"food",{food:{hunger:i.hunger,saturation:i.saturation},useAction:"eat"});const vd=[{name:"wood",tier:1,efficiency:2,durability:60,swordDamage:4,materialItem:"planks"},{name:"stone",tier:2,efficiency:4,durability:132,swordDamage:5,materialItem:"cobblestone"},{name:"ferrite",tier:3,efficiency:6,durability:260,swordDamage:6,materialItem:"ferrite_ingot"},{name:"aurum",tier:4,efficiency:10,durability:40,swordDamage:4,materialItem:"aurum_ingot"},{name:"aetherite",tier:5,efficiency:12,durability:1600,swordDamage:8,materialItem:"aetherite_gem"}],xd=["pickaxe","axe","shovel","hoe","sword"];for(const i of vd)for(const t of xd)un(`${i.name}_${t}`,"tool",{stackSize:1,tool:{kind:t,tier:i.tier,efficiency:i.efficiency,damage:t==="sword"?i.swordDamage:1+i.tier*.5,durability:i.durability}});un("ferrite_shears","tool",{stackSize:1,tool:{kind:"shears",tier:3,efficiency:5,damage:1,durability:238}});const Sd=[{name:"leather",points:{head:1,chest:3,legs:2,feet:1},durability:80,toughness:0,materialItem:"leather"},{name:"ferrite",points:{head:2,chest:6,legs:5,feet:2},durability:240,toughness:0,materialItem:"ferrite_ingot"},{name:"aurum",points:{head:2,chest:5,legs:3,feet:1},durability:112,toughness:0,materialItem:"aurum_ingot"},{name:"aetherite",points:{head:3,chest:8,legs:6,feet:3},durability:528,toughness:2,materialItem:"aetherite_gem"}],Md=["head","chest","legs","feet"];for(const i of Sd)for(const t of Md)un(`${i.name}_${t}`,"armor",{stackSize:1,armor:{slot:t,points:i.points[t],durability:i.durability,toughness:i.toughness}});un("bow","misc",{stackSize:1,useAction:"bow",projectile:{damage:5,speed:34},fuelSeconds:15});un("arrow","misc",{stackSize:64});un("name_tag","misc",{stackSize:16});un("ground_bone","misc",{stackSize:64,useAction:"bone_meal"});un("bucket","misc",{stackSize:1});un("water_bucket","misc",{stackSize:1,blockId:-99});const rx={planks:15,log:15,log_pine:15,log_dune:15,coal_block:800,sapling_sable:5,sapling_pine:5,sapling_dune:5,dead_bush:5,tall_grass:3,wool:5,wool_red:5,wool_blue:5,wool_yellow:5,crafting_table:15,chest:15,door_closed:15};for(const[i,t]of Object.entries(rx)){const e=cn.get(i);e&&(e.fuelSeconds=t)}function Ri(i){return cn.get(i)}function bd(){return[...cn.values()]}function ur(i){return cn.get(i)?.stackSize??64}function Ss(i){const t=cn.get(i);return t?t.tool?t.tool.durability:t.armor?t.armor.durability:0:0}function ci(i){return cn.get(i)?.tool}function Yr(i){return cn.get(i)?.armor}function sc(i){return cn.get(i)?.fuelSeconds??0}function So(i){return cn.get(i)?.food}function yd(i){return cn.get(i)?.blockId??-1}function Ed(i){return cn.get(i)?.kind==="block"}function rc(i){const t=ce(i);if(t&&!Yl.has(t.name))return t.name}const hr=[{id:"bramblehog",category:"passive",model:"quadruped",health:10,speed:2.1,hostileSpeed:2.1,damage:0,size:{w:.9,h:1.05},drops:[{item:"raw_meat",min:1,max:2},{item:"leather",min:0,max:1}],xpDrop:2,spawnLightMax:15,spawnBiome:["plains","forest","beach"],spawnSurface:!0,spawnUnderground:!1,minY:28,maxY:90,burnsInDaylight:!1,colors:{body:11561558,head:12615528,accent:9062970,legs:8011828},babyScale:.55,breedItem:"wheat",breedCooldownSeconds:45,fleeRadius:8},{id:"woolback",category:"passive",model:"quadruped",health:10,speed:2,hostileSpeed:2,damage:0,size:{w:1,h:1.25},drops:[{item:"wool",min:1,max:2}],xpDrop:2,spawnLightMax:15,spawnBiome:["plains","forest","mountains"],spawnSurface:!0,spawnUnderground:!1,minY:28,maxY:90,burnsInDaylight:!1,colors:{body:15262420,head:14208954,accent:12630180,legs:11577492},babyScale:.55,breedItem:"wheat",breedCooldownSeconds:45,shearDrop:{item:"wool",min:1,max:3},fleeRadius:8},{id:"cluckhen",category:"passive",model:"bird",health:4,speed:2.2,hostileSpeed:2.2,damage:0,size:{w:.5,h:.75},drops:[{item:"feather",min:1,max:2},{item:"raw_meat",min:1,max:1}],xpDrop:1,spawnLightMax:15,spawnBiome:["plains","forest"],spawnSurface:!0,spawnUnderground:!1,minY:28,maxY:90,burnsInDaylight:!1,colors:{body:16118506,head:16448245,accent:14174762,legs:14196784},babyScale:.5,breedItem:"seeds",breedCooldownSeconds:30,fleeRadius:7},{id:"hornbleat",category:"passive",model:"quadruped",health:10,speed:2,hostileSpeed:2,damage:0,size:{w:.95,h:1.3},drops:[{item:"raw_meat",min:1,max:2},{item:"leather",min:1,max:2}],xpDrop:2,spawnLightMax:15,spawnBiome:["mountains","plains"],spawnSurface:!0,spawnUnderground:!1,minY:30,maxY:95,burnsInDaylight:!1,colors:{body:9071178,head:8019006,accent:15260872,legs:6178096},babyScale:.55,breedItem:"wheat",breedCooldownSeconds:45,fleeRadius:8},{id:"cave_crawler",category:"neutral",model:"crawler",health:12,speed:3.1,hostileSpeed:4.4,damage:2,size:{w:1.1,h:.8},drops:[{item:"string",min:1,max:2}],xpDrop:4,spawnLightMax:7,spawnBiome:["*"],spawnSurface:!1,spawnUnderground:!0,minY:2,maxY:50,burnsInDaylight:!1,colors:{body:4868690,head:3816002,accent:9054762,legs:3026484},babyScale:.6,fleeRadius:0},{id:"shadewisp",category:"hostile",model:"wisp",health:16,speed:2.4,hostileSpeed:3.6,damage:3,size:{w:.7,h:1.8},drops:[{item:"ember_dust",min:0,max:1,chance:.3}],xpDrop:5,spawnLightMax:7,spawnBiome:["*"],spawnSurface:!0,spawnUnderground:!0,minY:2,maxY:90,burnsInDaylight:!0,colors:{body:3812946,head:4864616,accent:10111704,legs:2760768},babyScale:.9},{id:"rattler",category:"hostile",model:"biped",health:14,speed:2.3,hostileSpeed:3.1,damage:2,size:{w:.7,h:1.8},drops:[{item:"bone",min:1,max:2},{item:"string",min:1,max:1,chance:.5}],xpDrop:5,spawnLightMax:7,spawnBiome:["*"],spawnSurface:!0,spawnUnderground:!0,minY:2,maxY:90,burnsInDaylight:!0,ranged:{damage:3,speed:26,cooldown:2.2,range:16},colors:{body:14210248,head:14999764,accent:9078904,legs:12894384},babyScale:.9},{id:"rime_wisp",category:"hostile",model:"wisp",health:18,speed:2.2,hostileSpeed:3.2,damage:3,size:{w:.7,h:1.8},drops:[{item:"frostglass",min:1,max:1,chance:.4},{item:"aetherite_gem",min:1,max:1,chance:.04}],xpDrop:7,spawnLightMax:7,spawnBiome:["snow_taiga","mountains"],spawnSurface:!0,spawnUnderground:!0,minY:2,maxY:95,burnsInDaylight:!1,slowsOnHit:!0,colors:{body:13625584,head:14742778,accent:7391464,legs:11065576},babyScale:.9}],ox=new Map;for(const i of hr)ox.set(i.id,i);const ue=1e-4;function Fo(i,t){return[Math.floor(i-t+ue),Math.floor(i+t-ue)]}function Bo(i,t){return[Math.floor(i-t+ue),Math.floor(i+t-ue)]}function oi(i,t,e,n,s,r){for(let o=s;o<=r;o++)for(let a=t;a<=e;a++)if(Fe(i.getBlock(a,n,o)))return!0;return!1}function ax(i,t,e,n,s,r){for(let o=s;o<=r;o++)for(let a=t;a<=e;a++)if(or(i.getBlock(a,n,o)))return!0;return!1}function Nu(i,t,e,n,s,r){const o=s/2,[a,l]=Fo(t,o),[c,u]=Bo(n,o);for(let h=Math.floor(e+ue);h<=Math.floor(e+r-ue);h++)if(oi(i,a,l,h,c,u))return!0;return!1}function Uu(i,t,e,n,s,r,o){if(s===0)return{x:t,blocked:!1};const a=r/2,[l,c]=Bo(n,a),u=Math.floor(e+ue),h=Math.floor(e+o-ue),d=t+s;if(s>0){const f=Math.floor(t+a-ue),g=Math.floor(d+a-ue);for(let _=f+1;_<=g;_++)for(let p=u;p<=h;p++)if(oi(i,_,_,p,l,c))return{x:_-a,blocked:!0}}else{const f=Math.floor(t-a+ue),g=Math.floor(d-a+ue);for(let _=f-1;_>=g;_--)for(let p=u;p<=h;p++)if(oi(i,_,_,p,l,c))return{x:_+1+a,blocked:!0}}return{x:d,blocked:!1}}function lx(i,t,e,n,s,r,o){if(s===0)return{y:e,landed:!1,ceiling:!1};const a=r/2,[l,c]=Fo(t,a),[u,h]=Bo(n,a),d=e+s;if(s<0){const f=Math.floor(e+ue),g=Math.floor(d+ue);for(let _=f;_>=g;_--)if(oi(i,l,c,_,u,h))return{y:_+1,landed:!0,ceiling:!1}}else{const f=Math.floor(e+o-ue),g=Math.floor(d+o-ue);for(let _=f+1;_<=g;_++)if(oi(i,l,c,_,u,h))return{y:_-o,landed:!1,ceiling:!0}}return{y:d,landed:!1,ceiling:!1}}function Ou(i,t,e,n,s,r,o){if(s===0)return{z:n,blocked:!1};const a=r/2,[l,c]=Fo(t,a),u=Math.floor(e+ue),h=Math.floor(e+o-ue),d=n+s;if(s>0){const f=Math.floor(n+a-ue),g=Math.floor(d+a-ue);for(let _=f+1;_<=g;_++)for(let p=u;p<=h;p++)if(oi(i,l,c,p,_,_))return{z:_-a,blocked:!0}}else{const f=Math.floor(n-a+ue),g=Math.floor(d-a+ue);for(let _=f-1;_>=g;_--)for(let p=u;p<=h;p++)if(oi(i,l,c,p,_,_))return{z:_+1+a,blocked:!0}}return{z:d,blocked:!1}}function wd(i,t,e,n,s,r,o,a={}){const l=a.width??Ch,c=a.height??co,u=a.stepHeight??Lh;let h=t,d=e,f=n,g=!1;const _=Uu(i,h,d,f,s,l,c);if(_.blocked){const L=d+u,B=u>0&&!Nu(i,h,L,f,l,c)?Uu(i,h,L,f,s,l,c):null;B&&!B.blocked?(h=B.x,d=L):(h=_.x,g=!0)}else h=_.x;const p=lx(i,h,d,f,r,l,c);d=p.y;const m=Ou(i,h,d,f,o,l,c);if(m.blocked){const L=d+u,B=u>0&&!Nu(i,h,L,f,l,c)?Ou(i,h,L,f,o,l,c):null;B&&!B.blocked?(f=B.z,d=L):(f=m.z,g=!0)}else f=m.z;const y=l/2,[M,A]=Fo(h,y),[U,C]=Bo(f,y);let E=!1;const P=Math.floor(d+c-ue);for(let L=Math.floor(d+ue);L<=P;L++)if(ax(i,M,A,L,U,C)){E=!0;break}const b=Math.floor(d+ue)-1,x=p.landed||oi(i,M,A,b,U,C)&&d-(b+1)<ue;return{x:h,y:d,z:f,onGround:x,hitCeiling:p.ceiling,hitWall:g,inWater:E}}function vi(i,t){return`${i},${t}`}function Se(i,t,e){return(t*mt+e)*it+i}function is(i,t,e){return i>=0&&i<it&&t>=0&&t<qt&&e>=0&&e<mt}class cx{cx;cz;blocks;skyLight;blockLight;biomes;heightMap;generated=!1;modified=!1;meshDirty=!0;lightDirty=!0;entitiesLoaded=!1;constructor(t,e){this.cx=t,this.cz=e,this.blocks=new Uint8Array(to),this.skyLight=new Uint8Array(to),this.blockLight=new Uint8Array(to),this.biomes=new Uint8Array(it*mt),this.heightMap=new Uint8Array(it*mt)}getBlock(t,e,n){return is(t,e,n)?this.blocks[Se(t,e,n)]:0}setBlockRaw(t,e,n,s){is(t,e,n)&&(this.blocks[Se(t,e,n)]=s,this.modified=!0)}getSky(t,e,n){return e>=qt?15:is(t,e,n)?this.skyLight[Se(t,e,n)]:0}setSky(t,e,n,s){is(t,e,n)&&(this.skyLight[Se(t,e,n)]=s)}getBlockLight(t,e,n){return is(t,e,n)?this.blockLight[Se(t,e,n)]:0}setBlockLight(t,e,n,s){is(t,e,n)&&(this.blockLight[Se(t,e,n)]=s)}getBiome(t,e){return this.biomes[e*it+t]}setBiome(t,e,n){this.biomes[e*it+t]=n}columnHeight(t,e){return this.heightMap[e*it+t]}recomputeHeight(t,e){for(let n=qt-1;n>=0;n--)if(this.blocks[Se(t,n,e)]!==0)return this.heightMap[e*it+t]=n,n;return this.heightMap[e*it+t]=0,0}recomputeAllHeights(){for(let t=0;t<mt;t++)for(let e=0;e<it;e++)this.recomputeHeight(e,t)}topSolidY(t,e){for(let n=qt-1;n>=0;n--){const s=this.blocks[Se(t,n,e)];if(s!==0&&ce(s).solid)return n}return-1}forEachBlock(t){for(let e=0;e<qt;e++)for(let n=0;n<mt;n++)for(let s=0;s<it;s++){const r=this.blocks[Se(s,e,n)];t(r,s,e,n)}}}const Ad=0,Td=1,nr=2,oc=3,zo=4,ac=5,Ho=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],Pl=[[[1,0,0],[1,1,0],[1,1,1],[1,0,1]],[[0,0,1],[0,1,1],[0,1,0],[0,0,0]],[[0,1,1],[1,1,1],[1,1,0],[0,1,0]],[[0,0,0],[1,0,0],[1,0,1],[0,0,1]],[[0,0,1],[1,0,1],[1,1,1],[0,1,1]],[[1,0,0],[0,0,0],[0,1,0],[1,1,0]]],Rd=[[[0,0],[0,1],[1,1],[1,0]],[[0,0],[0,1],[1,1],[1,0]],[[0,0],[1,0],[1,1],[0,1]],[[0,0],[1,0],[1,1],[0,1]],[[0,0],[1,0],[1,1],[0,1]],[[0,0],[1,0],[1,1],[0,1]]],ku=[0,1,0],Il=[1,1,1,1],ux=[[0,0,0],[0,1,0],[1,1,1],[1,0,1]],hx=[[1,0,0],[1,1,0],[0,1,1],[0,0,1]],Fu=[[0,0],[0,1],[1,1],[1,0]];function Aa(){return{positions:[],normals:[],uvs:[],sky:[],block:[],ao:[],indices:[]}}function dx(i,t,e){if(i&&t)return .5;const n=(i?1:0)+(t?1:0)+(e?1:0);return n===0?1:n===1?.82:n===2?.66:.5}function Ta(i){return{positions:new Float32Array(i.positions),normals:new Float32Array(i.normals),uvs:new Float32Array(i.uvs),sky:new Float32Array(i.sky),block:new Float32Array(i.block),ao:new Float32Array(i.ao),indices:new Uint32Array(i.indices)}}function Mo(i,t,e,n,s,r,o,a,l,c,u){const h=s%We,d=s/We|0,f=i.positions.length/3;for(let g=0;g<4;g++)i.positions.push(l+t[g][0],c+t[g][1],u+t[g][2]),i.normals.push(n[0],n[1],n[2]),i.uvs.push((h+e[g][0])/We,(d+e[g][1])/We),i.sky.push(r),i.block.push(o),i.ao.push(a[g]);i.indices.push(f,f+1,f+2,f,f+2,f+3)}const Bu=[1,1,1,1];function Ra(i,t,e,n){return ce(i.getBlock(t,e,n)).opaque}function fx(i,t,e,n,s,r){const o=Ho[t],a=o[0]!==0?0:o[1]!==0?1:2,l=a===0?1:0,c=a===2?1:2,u=e+o[0],h=n+o[1],d=s+o[2];for(let f=0;f<4;f++){const g=r[f][l]===0?-1:1,_=r[f][c]===0?-1:1,p=l===0?u+g:u,m=l===1?h+g:h,y=l===2?d+g:d,M=c===0?u+_:u,A=c===1?h+_:h,U=c===2?d+_:d;Bu[f]=dx(Ra(i,p,m,y),Ra(i,M,A,U),Ra(i,u+(l===0?g:0)+(c===0?_:0),h+(l===1?g:0)+(c===1?_:0),d+(l===2?g:0)+(c===2?_:0)))}return Bu}function px(i,t,e,n,s,r,o,a,l,c,u,h){const d=fx(t,e,o,a,l,Pl[e]);Mo(i,Pl[e],Rd[e],Ho[e],n,s,r,d,c,u,h)}const mx=.1875;function gx(i,t,e,n){return Fe(i.getBlock(t-1,e,n))&&Fe(i.getBlock(t+1,e,n))?!0:!(Fe(i.getBlock(t,e,n-1))&&Fe(i.getBlock(t,e,n+1)))}function _x(i,t){const e=mx;return i?t?[0,0,0,e,1,1]:[0,0,0,1,1,e]:t?[0,0,.5-e/2,1,1,.5+e/2]:[.5-e/2,0,0,.5+e/2,1,1]}function vx(i,t,e,n,s,r,o,a,l,c){const[u,h,d,f,g,_]=e;for(let p=0;p<6;p++){const m=Ho[p],y=t.getSkyLight(s+m[0],r+m[1],o+m[2])/ei,M=t.getBlockLight(s+m[0],r+m[1],o+m[2])/ei,A=Pl[p].map(([U,C,E])=>[U?f:u,C?g:h,E?_:d]);Mo(i,A,Rd[p],m,n(p),y,M,Il,a,l,c)}}function xx(i,t,e,n,s,r,o){Mo(i,ux,Fu,ku,t,e,n,Il,s,r,o),Mo(i,hx,Fu,ku,t,e,n,Il,s,r,o)}function Sx(i,t,e){const n=Aa(),s=Aa(),r=Aa(),o=t.cx*it,a=t.cz*mt;for(let l=0;l<qt;l++)for(let c=0;c<mt;c++)for(let u=0;u<it;u++){const h=t.blocks[Se(u,l,c)];if(h===0)continue;const d=ce(h),f=o+u,g=a+c;if(h===T.DOOR_CLOSED||h===T.DOOR_OPEN){const p=gx(i,f,l,g);vx(n,i,_x(h===T.DOOR_OPEN,p),m=>e(h,m),f,l,g,u,l,c);continue}if(d.render==="cross"){const p=i.getSkyLight(f,l,g)/ei,m=i.getBlockLight(f,l,g)/ei;xx(r,e(h,nr),p,m,u,l,c);continue}const _=d.render==="liquid"?s:n;for(let p=0;p<6;p++){const m=Ho[p],y=f+m[0],M=l+m[1],A=g+m[2],U=i.getBlock(y,M,A);if(U!==0){const P=ce(U);if(P.opaque||d.render==="liquid"&&or(U)||d.render==="cube"&&U===h||d.render==="liquid"&&P.render==="cross")continue}const C=i.getSkyLight(y,M,A)/ei,E=i.getBlockLight(y,M,A)/ei;px(_,i,p,e(h,p),C,E,f,l,g,u,l,c)}}return{opaque:Ta(n),water:Ta(s),plants:Ta(r)}}function Mx(i){return i!==T.AIR&&!or(i)}function Cd(i,t,e,n,s,r,o,a){const l=Math.hypot(s,r,o);if(l===0||a<=0)return null;const c=s/l,u=r/l,h=o/l;let d=Math.floor(t),f=Math.floor(e),g=Math.floor(n);const _=c>0?1:c<0?-1:0,p=u>0?1:u<0?-1:0,m=h>0?1:h<0?-1:0,y=_===0?Number.POSITIVE_INFINITY:Math.abs(1/c),M=p===0?Number.POSITIVE_INFINITY:Math.abs(1/u),A=m===0?Number.POSITIVE_INFINITY:Math.abs(1/h),U=(L,B,G)=>G>0?B+1-L:G<0?L-B:Number.POSITIVE_INFINITY;let C=_===0?Number.POSITIVE_INFINITY:U(t,d,_),E=p===0?Number.POSITIVE_INFINITY:U(e,f,p),P=m===0?Number.POSITIVE_INFINITY:U(n,g,m),b=nr,x=0;for(;x<=a;){const L=i.getBlock(d,f,g);if(Mx(L))return{x:d,y:f,z:g,id:L,face:b,distance:x};C<E&&C<P?(x=C,d+=_,C+=y,b=_>0?Td:Ad):E<P?(x=E,f+=p,E+=M,b=p>0?oc:nr):(x=P,g+=m,P+=A,b=m>0?ac:zo)}return null}function bx(i,t,e){const n=e.x-t.x,s=e.y-t.y,r=e.z-t.z,o=Math.hypot(n,s,r);return o===0?!0:Cd(i,t.x,t.y,t.z,n,s,r,o)===null}const yx=32,Ex=40,wx=8,Ax=1,Tx=6,Rx=.55,Cx=1.45;function Lx(i){return 1.1+i.size.w/2}function Px(i,t,e){return i.damage<=0&&!i.ranged?!1:i.category==="hostile"?t.isNight||t.light<wx:i.category==="neutral"?e:!1}function Ix(i){return i.ranged?i.ranged.range:Lx(i)}function Dx(i,t,e){const n=i.def,s=i.provoked>0,r=i.hurtTime>0;if(t.playerAlive&&Px(n,t,s)){const o=i.state==="approach"||i.state==="attack",a=o?Ex:yx;if(t.distance<=a&&(t.canSee||o))return{state:t.distance<=Ix(n)&&t.canSee?"attack":"approach"}}if(n.category==="passive"&&t.playerAlive){const o=n.fleeRadius??Tx;if(r||i.state==="flee"&&i.stateTime<3&&t.distance<o*2)return{state:"flee",duration:3}}return i.state==="flee"||i.state==="approach"||i.state==="attack"?{state:"idle",duration:e.range(1,3)}:i.stateTime<i.stateDuration?{state:i.state}:i.state==="idle"?{state:"wander",heading:e.range(-Math.PI,Math.PI),duration:e.range(2,5)}:{state:"idle",duration:e.range(1,4)}}function Nx(i,t){t.state!==i.state&&(i.state=t.state,i.stateTime=0),t.heading!==void 0&&(i.heading=t.heading),t.duration!==void 0&&(i.stateDuration=t.duration)}function Ux(i){const t=i.def;switch(i.state){case"wander":return t.speed*Rx;case"flee":return t.speed*Cx;case"approach":return t.hostileSpeed;case"attack":return t.ranged?0:t.hostileSpeed*.5;default:return 0}}const Ee={OCEAN:0,BEACH:1,PLAINS:2,FOREST:3,DESERT:4,MOUNTAINS:5,SNOW_TAIGA:6},bo=[{id:Ee.OCEAN,name:"ocean",topBlock:T.SAND,fillerBlock:T.SAND,fillerDepth:3,tree:"none",treeAttempts:0,grassDensity:0,flowerDensity:0,cactusDensity:0,boulderChance:0,campChance:0,snow:!1},{id:Ee.BEACH,name:"beach",topBlock:T.SAND,fillerBlock:T.SAND,fillerDepth:3,tree:"none",treeAttempts:0,grassDensity:0,flowerDensity:0,cactusDensity:0,boulderChance:.01,campChance:.004,snow:!1},{id:Ee.PLAINS,name:"plains",topBlock:T.GRASS,fillerBlock:T.DIRT,fillerDepth:3,tree:"sable",treeAttempts:2,grassDensity:.14,flowerDensity:.02,cactusDensity:0,boulderChance:.006,campChance:.006,snow:!1},{id:Ee.FOREST,name:"forest",topBlock:T.GRASS,fillerBlock:T.DIRT,fillerDepth:3,tree:"sable",treeAttempts:11,grassDensity:.18,flowerDensity:.03,cactusDensity:0,boulderChance:.01,campChance:.005,snow:!1},{id:Ee.DESERT,name:"desert",topBlock:T.SAND,fillerBlock:T.SAND,fillerDepth:4,tree:"dune",treeAttempts:1,grassDensity:0,flowerDensity:0,cactusDensity:.012,boulderChance:.004,campChance:.008,snow:!1},{id:Ee.MOUNTAINS,name:"mountains",topBlock:T.STONE,fillerBlock:T.STONE,fillerDepth:3,tree:"pine",treeAttempts:2,grassDensity:.03,flowerDensity:.004,cactusDensity:0,boulderChance:.03,campChance:.002,snow:!0},{id:Ee.SNOW_TAIGA,name:"snow_taiga",topBlock:T.SNOW_GRASS,fillerBlock:T.DIRT,fillerDepth:3,tree:"pine",treeAttempts:6,grassDensity:.04,flowerDensity:.004,cactusDensity:0,boulderChance:.012,campChance:.003,snow:!0}];function ss(i){return bo[i]??bo[Ee.PLAINS]}const Ox=24,kx=48,Fx=72,Bx=24,zx=11;function Ld(i,t,e,n,s){const r=i.getSkyLight(t,e,n);return Math.max(i.getBlockLight(t,e,n),s?Math.max(0,r-zx):r)}function Hx(i){let t=0,e=0;for(const n of i)n.def.category==="hostile"?e++:t++;return{passive:t,hostile:e,total:i.length}}function Gx(i,t,e){return bo[i.getBiome(t,e)]?.name??""}function Vx(i,t,e,n,s){const r=Math.ceil(t.size.h);for(let o=0;o<r;o++){const a=i.getBlock(e,n+o,s);if(Fe(a)||or(a))return!1}return Fe(i.getBlock(e,n-1,s))}function Wx(i,t,e,n,s,r){return n<t.minY||n>t.maxY||!t.spawnBiome.includes("*")&&!t.spawnBiome.includes(Gx(i,e,s))||!Vx(i,t,e,n,s)?!1:Ld(i,e,n,s,r)<=t.spawnLightMax}function Xx(i,t,e,n){const s=e.range(0,Math.PI*2),r=e.range(Ox,kx),o=Math.floor(t.x+Math.cos(s)*r),a=Math.floor(t.z+Math.sin(s)*r);if(!i.isBlockLoaded(o,a))return null;const l=i.highestSolidY(o,a)+1;if(!n)return{x:o,y:l,z:a};const c=Math.min(l-4,qt-2);if(c<=4)return null;for(let u=0;u<6;u++){const h=e.intRange(4,c);if(!Fe(i.getBlock(o,h,a))&&Fe(i.getBlock(o,h-1,a)))return{x:o,y:h,z:a}}return null}function Yx(i,t,e,n,s,r=hr){if(n.total>=wf)return null;const o=n.hostile<Af,a=n.passive<Tf,l=r.filter(d=>d.category==="hostile"?o:a);if(l.length===0)return null;const c=l[s.nextInt(l.length)],u=c.spawnUnderground&&(!c.spawnSurface||s.next()<.5),h=Xx(i,t,s,u);return!h||c.category==="passive"&&e||!Wx(i,c,h.x,h.y,h.z,e)?null:{def:c,x:h.x+.5,y:h.y,z:h.z+.5}}function qx(i,t,e){const n=Math.hypot(i.x-t.x,i.z-t.z);return n>Fx?!0:i.def.category==="hostile"&&!e&&n>Bx}function Ca(i){return i.model==="wisp"}const $x=.5,qr=.5,Kx=20,zu=6,jx=4,Zx=7.5,Hu=48,Jx=1;function Qx(i,t){const e=[];for(const n of i.drops){if(n.chance!==void 0&&t.next()>=n.chance)continue;const s=t.intRange(n.min,n.max);s>0&&e.push({item:n.item,count:s})}return e}class tS{constructor(t){this.rng=t}entities=[];nextId=1;spawnTimer=0;aiCursor=0;spawningEnabled=!0;create(t,e,n,s){const r={id:this.nextId++,def:t,x:e,y:n,z:s,vx:0,vy:0,vz:0,yaw:this.rng.range(-Math.PI,Math.PI),health:t.health,state:"idle",stateTime:0,stateDuration:this.rng.range(.5,2),heading:0,attackCooldown:0,hurtTime:0,provoked:0,onGround:!1,age:0,walkPhase:0,burnTimer:0};return this.entities.push(r),r}tick(t,e,n,s={}){if(this.spawnTimer+=n,this.spawningEnabled&&this.spawnTimer>=$x){this.spawnTimer=0;const a=Yx(t,e,t.isNight,Hx(this.entities),this.rng);a&&this.create(a.def,a.x,a.y,a.z)}const r=this.entities.length,o=new Set;for(let a=0;a<Math.min(r,Hu);a++)o.add(this.entities[(this.aiCursor+a)%r]);this.aiCursor=r>0?(this.aiCursor+Hu)%r:0;for(let a=this.entities.length-1;a>=0;a--){const l=this.entities[a];if(qx(l,e,t.isNight)){this.entities.splice(a,1);continue}t.isBlockLoaded(Math.floor(l.x),Math.floor(l.z))&&(this.update(t,l,e,n,o.has(l),s),l.health<=0&&this.kill(a,s))}}damage(t,e,n,s){if(t.health<=0||t.hurtTime>qr*.5)return;t.health-=e,t.hurtTime=qr,t.provoked=Kx;const r=t.x-n,o=t.z-s,a=Math.hypot(r,o)||1;t.vx=r/a*zu,t.vz=o/a*zu,t.vy=Math.max(t.vy,jx)}raycast(t,e,n){let s=null;for(const r of this.entities){const o=r.def.size.w/2,a=eS(t,e,r.x-o,r.y,r.z-o,r.x+o,r.y+r.def.size.h,r.z+o);a===null||a>n||(!s||a<s.distance)&&(s={entity:r,distance:a})}return s}clear(){this.entities.length=0}toJSON(){return this.entities.map(t=>({type:t.def.id,x:t.x,y:t.y,z:t.z,yaw:t.yaw,health:t.health}))}load(t){if(this.clear(),!!Array.isArray(t))for(const e of t){if(!e||typeof e!="object")continue;const n=e,s=hr.find(o=>o.id===n.type);if(!s||![n.x,n.y,n.z].every(o=>typeof o=="number"&&Number.isFinite(o)))continue;const r=this.create(s,n.x,n.y,n.z);typeof n.yaw=="number"&&(r.yaw=n.yaw),typeof n.health=="number"&&n.health>0&&(r.health=Math.min(s.health,n.health))}}kill(t,e){const[n]=this.entities.splice(t,1);for(const s of Qx(n.def,this.rng))e.dropLoot?.(s,n.x,n.y+.5,n.z)}update(t,e,n,s,r,o){const a=e.def;e.age+=s,e.stateTime+=s,e.hurtTime=Math.max(0,e.hurtTime-s),e.provoked=Math.max(0,e.provoked-s),e.attackCooldown=Math.max(0,e.attackCooldown-s);const l=n.x-e.x,c=n.z-e.z,u=Math.hypot(l,n.y-e.y,c);if(r){const p=Math.floor(e.x),m=Math.floor(e.y+a.size.h*.5),y=Math.floor(e.z),M={x:e.x,y:e.y+a.size.h*.85,z:e.z},A={x:n.x,y:n.y+n.eyeHeight,z:n.z},U={distance:u,canSee:u<40&&bx(t,M,A),light:Ld(t,p,m,y,t.isNight),isNight:t.isNight,playerAlive:n.alive};Nx(e,Dx(e,U,this.rng))}a.burnsInDaylight&&!t.isNight&&t.getSkyLight(Math.floor(e.x),Math.floor(e.y+a.size.h),Math.floor(e.z))>=15&&(e.burnTimer+=s,e.burnTimer>=1&&(e.burnTimer-=1,e.health-=Jx,e.hurtTime=qr));let h=e.heading;(e.state==="approach"||e.state==="attack")&&(h=Math.atan2(l,c)),e.state==="flee"&&(h=Math.atan2(-l,-c));const d=Ux(e);if(!(e.hurtTime>qr*.6)){const p=Math.min(1,s*8);e.vx+=(Math.sin(h)*d-e.vx)*p,e.vz+=(Math.cos(h)*d-e.vz)*p}if(d>0&&(e.yaw=h),Ca(a)){const p=e.state==="approach"||e.state==="attack"?n.y+1:t.highestSolidY(Math.floor(e.x),Math.floor(e.z))+3;e.vy+=(Math.sign(p-e.y)*Math.min(2,Math.abs(p-e.y))-e.vy)*Math.min(1,s*3)}else e.vy=Math.max(Vl,e.vy+ps*s);const g=wd(t,e.x,e.y,e.z,e.vx*s,e.vy*s,e.vz*s,{width:a.size.w,height:a.size.h,stepHeight:e.onGround?.55:0});g.hitWall&&g.onGround&&d>0&&!Ca(a)?e.vy=Zx:g.onGround&&e.vy<0&&(e.vy=0),g.hitCeiling&&e.vy>0&&(e.vy=0),g.inWater&&!Ca(a)&&(e.vy=Math.max(e.vy,1.5));const _=Math.hypot(g.x-e.x,g.z-e.z);if(e.walkPhase+=_*2.4,e.x=g.x,e.y=g.y,e.z=g.z,e.onGround=g.onGround,e.state==="attack"&&e.attackCooldown<=0&&n.alive){e.attackCooldown=a.ranged?a.ranged.cooldown:Ax;const p=a.ranged?a.ranged.damage:a.damage,m=Math.hypot(l,c)||1;p>0&&o.damagePlayer?.(p,e,l/m,c/m)}}}function eS(i,t,e,n,s,r,o,a){let l=0,c=Number.POSITIVE_INFINITY;const u=[[i.x,t.x,e,r],[i.y,t.y,n,o],[i.z,t.z,s,a]];for(const[h,d,f,g]of u){if(Math.abs(d)<1e-12){if(h<f||h>g)return null;continue}let _=(f-h)/d,p=(g-h)/d;if(_>p&&([_,p]=[p,_]),l=Math.max(l,_),c=Math.min(c,p),l>c)return null}return l}function nS(i){let t=i|0;return t=Math.imul(t^t>>>16,73244475),t=Math.imul(t^t>>>16,73244475),(t^t>>>16)>>>0}function Js(i,t,e=0){let n=Math.imul(i|0,668265261)^Math.imul(t|0,374761393)^Math.imul(e|0,2654435769);return n=Math.imul(n^n>>>15,2246822507),n=Math.imul(n^n>>>13,3266489909),(n^n>>>16)>>>0}function Dl(i,t,e,n=0){let s=Math.imul(i|0,668265261)^Math.imul(t|0,374761393)^Math.imul(e|0,461845907)^Math.imul(n|0,2654435769);return s=Math.imul(s^s>>>15,2246822507),s=Math.imul(s^s>>>13,3266489909),(s^s>>>16)>>>0}function iS(i,t,e=0){return Js(i,t,e)/4294967296}function Gu(i,t,e,n=0){return Dl(i,t,e,n)/4294967296}class Ci{state;constructor(t){this.state=t>>>0,this.state===0&&(this.state=2654435769)}next(){let t=this.state+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}nextInt(t){return Math.floor(this.next()*t)}range(t,e){return t+this.next()*(e-t)}intRange(t,e){return t+Math.floor(this.next()*(e-t+1))}chance(t){return this.next()<t}pick(t){return t[this.nextInt(t.length)]}shuffle(t){for(let e=t.length-1;e>0;e--){const n=this.nextInt(e+1),s=t[e];t[e]=t[n],t[n]=s}return t}}const lc=[];let Pd=0;function ae(i,t,e,n=1,s="table"){const r={type:"shaped",id:`r${Pd++}`,pattern:i,key:t,result:{item:e,count:n},station:s};return lc.push(r),r}function hn(i,t,e=1,n="hand"){const s={type:"shapeless",id:`r${Pd++}`,ingredients:i,result:{item:t,count:e},station:n};return lc.push(s),s}for(const i of["log","log_pine","log_dune"])hn([i],"planks",4,"hand");ae(["P","P"],{P:"planks"},"stick",4,"hand");ae(["PP","PP"],{P:"planks"},"crafting_table",1,"hand");ae(["CCC","C C","CCC"],{C:"cobblestone"},"furnace",1);ae(["PPP","P P","PPP"],{P:"planks"},"chest",1);ae(["P P","PPP","P P"],{P:"planks"},"door_closed",3);ae(["C","S"],{C:"coal",S:"stick"},"torch",4);ae(["C","S"],{C:"charcoal",S:"stick"},"torch",4);ae([" S ","SCS","SSS"],{S:"stick",C:"coal"},"campfire",1);ae(["WWW","PPP"],{W:"wool",P:"planks"},"bed",1);ae(["BB","BB"],{B:"brick"},"bricks",1);ae(["SS","SS"],{S:"stone"},"stone_bricks",4);ae(["SS","SS"],{S:"sandstone"},"sandstone_bricks",4);ae(["SS","SS"],{S:"understone"},"understone_bricks",4);ae(["SS","SS"],{S:"emberstone"},"emberstone_bricks",4);ae(["SS","SS"],{S:"rustrock"},"rustrock_bricks",4);hn(["cobblestone","tall_grass"],"mossy_stone",1);ae([" D ","DGD"," D "],{D:"ember_dust",G:"glass"},"emberlight",1);ae(["I I"," T ","I I"],{I:"ferrite_ingot",T:"torch"},"ferro_lantern",1);const sS={pickaxe:{pattern:["MMM"," S "," S "],station:"table"},axe:{pattern:["MM ","MS "," S "],station:"table"},shovel:{pattern:[" M "," S "," S "],station:"hand"},hoe:{pattern:["MM "," S "," S "],station:"table"},sword:{pattern:[" M "," M "," S "],station:"hand"}},rS={wood:"planks",stone:"cobblestone",ferrite:"ferrite_ingot",aurum:"aurum_ingot",aetherite:"aetherite_gem"};for(const[i,t]of Object.entries(rS))for(const[e,n]of Object.entries(sS))ae(n.pattern,{M:t,S:"stick"},`${i}_${e}`,1,n.station);ae(["I "," I"],{I:"ferrite_ingot"},"ferrite_shears",1);ae(["S T","S T","S T"],{S:"stick",T:"string"},"bow",1);ae(["F","S","H"],{F:"feather",S:"stick",H:"stone_shard"},"arrow",4);const oS={head:["MMM","M M"],chest:["M M","MMM","MMM"],legs:["MMM","M M","M M"],feet:["M M","M M"]},aS={leather:"leather",ferrite:"ferrite_ingot",aurum:"aurum_ingot",aetherite:"aetherite_gem"};for(const[i,t]of Object.entries(aS))for(const[e,n]of Object.entries(oS))ae(n,{M:t},`${i}_${e}`,1);hn(["string","leather"],"name_tag",1);hn(["bone"],"ground_bone",3,"hand");ae(["WWW"],{W:"wheat"},"bread",1,"hand");hn(["wool","flower_red"],"wool_red",1);hn(["wool","flower_blue"],"wool_blue",1);hn(["wool","flower_yellow"],"wool_yellow",1);ae(["I I"," I "],{I:"ferrite_ingot"},"bucket",1);ae(["CCC","CCC","CCC"],{C:"coal"},"coal_block",1);hn(["coal_block"],"coal",9);ae(["III","III","III"],{I:"ferrite_ingot"},"ferrite_block",1);hn(["ferrite_block"],"ferrite_ingot",9);ae(["III","III","III"],{I:"aurum_ingot"},"aurum_block",1);hn(["aurum_block"],"aurum_ingot",9);ae(["III","III","III"],{I:"copper_ingot"},"copper_block",1);hn(["copper_block"],"copper_ingot",9);ae(["GGG","GGG","GGG"],{G:"aetherite_gem"},"crystal_block",1);hn(["crystal_block"],"aetherite_gem",9);const ir=lc,cc=[{input:"raw_ferrite",output:"ferrite_ingot",count:1,seconds:10},{input:"raw_copper",output:"copper_ingot",count:1,seconds:10},{input:"raw_aurum",output:"aurum_ingot",count:1,seconds:10},{input:"sand",output:"glass",count:1,seconds:10},{input:"clay_ball",output:"brick",count:1,seconds:10},{input:"cobblestone",output:"stone",count:1,seconds:10},{input:"cobbled_understone",output:"understone",count:1,seconds:10},{input:"raw_meat",output:"cooked_meat",count:1,seconds:12},{input:"log",output:"charcoal",count:1,seconds:12},{input:"log_pine",output:"charcoal",count:1,seconds:12},{input:"log_dune",output:"charcoal",count:1,seconds:12}];function Go(i){return cc.find(t=>t.input===i)}const yo=0,Nl=1,Eo=2,lS=.5;function cS(){return{kind:"furnace",slots:[null,null,null],burnLeft:0,burnTotal:0,progress:0}}function Ul(i){return i.burnLeft>0}function uS(i){const t=i.slots[yo];if(!t)return!1;const e=Go(t.item);if(!e)return!1;const n=i.slots[Eo];return n?n.item===e.output&&n.count+e.count<=ur(n.item):!0}function hS(i){const t=i.slots[yo];return t?Go(t.item)?.seconds??0:0}function Vu(i,t){const e=i[t];e&&(i[t]=e.count>1?{item:e.item,count:e.count-1}:null)}function dS(i,t){const e=uS(i);if(i.burnLeft<=0&&e){const o=i.slots[Nl],a=o?sc(o.item):0;a>0&&(Vu(i.slots,Nl),i.burnLeft=a,i.burnTotal=a)}if(i.burnLeft<=0){i.progress=Math.max(0,i.progress-t*2);return}if(i.burnLeft=Math.max(0,i.burnLeft-t),!e){i.progress=0;return}i.progress+=t;const n=i.slots[yo],s=n?Go(n.item):void 0;if(!s||i.progress<s.seconds)return;i.progress=0,Vu(i.slots,yo);const r=i.slots[Eo];i.slots[Eo]=r?{item:r.item,count:r.count+s.count}:{item:s.output,count:s.count}}function fS(i,t){const e=Ul(i);let n=Math.max(0,t);for(;n>1e-9;){const r=Math.min(n,lS);dS(i,r),n-=r}const s=Ul(i);return{lit:s,changed:s!==e}}function pS(i,t){return i===Nl?sc(t.item)>0:i===Eo?!1:Go(t.item)!==void 0}function mS(i){const t=i.burnTotal>0?Math.round(i.burnLeft/i.burnTotal*100):0,e=hS(i),n=e>0?Math.round(i.progress/e*100):0;return{lit:Ul(i),fuel:t,smelt:n}}const Id=27;function gS(i){if(!i||typeof i!="object")return null;const t=i;if(typeof t.item!="string"||typeof t.count!="number"||t.count<=0)return null;const e={item:t.item,count:Math.floor(t.count)};return typeof t.durability=="number"&&(e.durability=t.durability),e}function Wu(i,t){const e=Array.isArray(i)?i:[],n=[];for(let s=0;s<t;s++)n.push(gS(e[s]));return n}function La(i){return typeof i=="number"&&Number.isFinite(i)&&i>0?i:0}function Pa(i,t,e){return`${i},${t},${e}`}function _S(i){return i==="furnace"?cS():{kind:"chest",slots:new Array(Id).fill(null)}}class wo{states=new Map;get size(){return this.states.size}get(t,e,n){return this.states.get(Pa(t,e,n))}open(t,e,n,s){const r=Pa(e,n,s),o=this.states.get(r);if(o&&o.kind===t)return o;const a=_S(t);return this.states.set(r,a),a}remove(t,e,n){const s=Pa(t,e,n),r=this.states.get(s);return r?(this.states.delete(s),r.slots.filter(o=>o!==null)):[]}*furnaces(){for(const[t,e]of this.states){if(e.kind!=="furnace")continue;const[n,s,r]=t.split(",").map(Number);yield[n,s,r,e]}}toJSON(){return[...this.states.entries()].sort(([t],[e])=>t<e?-1:t>e?1:0).map(([t,e])=>({key:t,state:JSON.parse(JSON.stringify(e))}))}static fromJSON(t){const e=new wo;if(!Array.isArray(t))return e;for(const n of t){if(!n||typeof n!="object")continue;const{key:s,state:r}=n;if(typeof s!="string"||!/^-?\d+,-?\d+,-?\d+$/.test(s)||!r||typeof r!="object")continue;const o=r;o.kind==="chest"?e.states.set(s,{kind:"chest",slots:Wu(o.slots,Id)}):o.kind==="furnace"&&e.states.set(s,{kind:"furnace",slots:Wu(o.slots,3),burnLeft:La(o.burnLeft),burnTotal:La(o.burnTotal),progress:La(o.progress)})}return e}}const vS=.4,xS=.75,Xu=.125;function SS(i,t){const e=ce(i);if(e.drops==="none")return[];if(e.drops==="self"){const s=rc(i);return s?[{item:s,count:1}]:[]}const n=[];for(const s of e.drops){if(s.chance!==void 0&&t.next()>=s.chance)continue;const r=t.intRange(s.min,s.max);r>0&&Ri(s.item)&&n.push({item:s.item,count:r})}return n}class MS{drops=[];spawn(t,e,n,s,r=2.5,o=vS){if(t.count<=0)return;const a={item:t.item,count:t.count,x:e,y:n,z:s,vy:r,age:0,pickupDelay:o};t.durability!==void 0&&(a.durability=t.durability),this.drops.push(a)}tick(t,e,n,s){for(const r of this.drops)r.age+=e,r.pickupDelay=Math.max(0,r.pickupDelay-e),!(n&&r.pickupDelay<=0&&this.attract(r,n,e))&&this.fall(t,r,e);this.merge();for(let r=this.drops.length-1;r>=0;r--){const o=this.drops[r];if(o.age>=Rf){this.drops.splice(r,1);continue}if(!n||o.pickupDelay>0)continue;const a=o.x-n.x,l=o.y-(n.y+co/2),c=o.z-n.z;if(a*a+l*l+c*c>Cc*Cc)continue;const u={item:o.item,count:o.count};o.durability!==void 0&&(u.durability=o.durability);const h=s(u);h?o.count=h.count:this.drops.splice(r,1)}}clear(){this.drops.length=0}attract(t,e,n){const s=e.x-t.x,r=e.y+co/2-t.y,o=e.z-t.z,a=Math.hypot(s,r,o);if(a>Uf||a<1e-6)return!1;const l=Math.min(a,Of*n)/a;return t.x+=s*l,t.y+=r*l,t.z+=o*l,t.vy=0,!0}fall(t,e,n){e.vy=Math.max(Vl,e.vy+ps*n);const s=e.y+e.vy*n,r=Math.floor(s-Xu);if(e.vy<=0&&Fe(t.getBlock(Math.floor(e.x),r,Math.floor(e.z)))){e.y=r+1+Xu,e.vy=0;return}e.y=s}merge(){for(let t=0;t<this.drops.length;t++){const e=this.drops[t];if(!(Ss(e.item)>0))for(let n=this.drops.length-1;n>t;n--){const s=this.drops[n];if(s.item!==e.item||Math.hypot(e.x-s.x,e.y-s.y,e.z-s.z)>xS)continue;const r=ur(e.item)-e.count;if(r<=0)break;const o=Math.min(r,s.count);e.count+=o,e.age=Math.min(e.age,s.age),s.count-=o,s.count<=0&&this.drops.splice(n,1)}}}}const bS=4,yS=.6,ES=.25,wS=.3,AS={tree_sable:{log:T.LOG,leaves:T.LEAVES,shape:"round",minTrunk:4,maxTrunk:5},tree_pine:{log:T.LOG_PINE,leaves:T.LEAVES_PINE,shape:"cone",minTrunk:6,maxTrunk:8},tree_dune:{log:T.LOG_DUNE,leaves:T.LEAVES_DUNE,shape:"flat",minTrunk:3,maxTrunk:4}};function uc(i){const t=ce(i).growth;return t!==void 0&&t.crop==="wheat"}function TS(i,t,e,n,s=bS){for(let r=0;r<=1;r++)for(let o=-s;o<=s;o++)for(let a=-s;a<=s;a++)if(i.getBlock(t+a,e+r,n+o)===T.WATER)return!0;return!1}function RS(i,t,e,n){const s=i.getBlock(t,e,n);if(s!==T.FARMLAND&&s!==T.FARMLAND_WET)return s;if(Fe(i.getBlock(t,e+1,n)))return i.setBlock(t,e,n,T.DIRT),T.DIRT;const r=TS(i,t,e,n)?T.FARMLAND_WET:T.FARMLAND;return r!==s&&i.setBlock(t,e,n,r),r}function hc(i,t,e,n,s=1){let r=i.getBlock(t,e,n),o=!1;for(let a=0;a<s;a++){const l=ce(r).growth?.next;if(l==null)break;r=l,o=!0}return o&&i.setBlock(t,e,n,r),o}function CS(i,t,e,n,s){return!uc(i.getBlock(t,e,n))||i.getBlock(t,e-1,n)!==T.FARMLAND_WET||s.next()>=yS?!1:hc(i,t,e,n)}function Hs(i,t,e,n,s){if(e<1||e>=qt)return;const r=i.getBlock(t,e,n);(r===T.AIR||r===T.TALL_GRASS||ce(r).render==="cross")&&i.setBlock(t,e,n,s)}function Dd(i,t,e,n,s){const r=ce(i.getBlock(t,e,n)),o=r.saplingOf?AS[r.saplingOf]:void 0;if(!o)return!1;const a=s.intRange(o.minTrunk,o.maxTrunk);if(e+a+3>=qt)return!1;for(let c=1;c<=a+1;c++){const u=i.getBlock(t,e+c,n);if(u!==T.AIR&&ce(u).render!=="cross")return!1}i.setBlock(t,e,n,o.log);for(let c=1;c<a;c++)i.setBlock(t,e+c,n,o.log);const l=e+a;if(o.shape==="round")for(let c=-2;c<=1;c++){const u=c<=-1?2:1;for(let h=-u;h<=u;h++)for(let d=-u;d<=u;d++)u===2&&Math.abs(h)===2&&Math.abs(d)===2||Hs(i,t+h,l+c,n+d,o.leaves)}else if(o.shape==="cone"){let c=0;for(let u=l;u>=e+2;u--){for(let h=-c;h<=c;h++)for(let d=-c;d<=c;d++)Math.abs(h)+Math.abs(d)>c+1||Hs(i,t+h,u,n+d,o.leaves);c=(c+1)%3}}else{for(let c=-2;c<=2;c++)for(let u=-2;u<=2;u++)Math.abs(c)===2&&Math.abs(u)===2||Hs(i,t+c,l,n+u,o.leaves);for(let c=-1;c<=1;c++)for(let u=-1;u<=1;u++)Hs(i,t+c,l+1,n+u,o.leaves)}return Hs(i,t,l+1,n,o.leaves),!0}function LS(i,t,e,n,s){const r=i.getBlock(t,e,n);return uc(r)||r===T.DEWBERRY_EMPTY?hc(i,t,e,n,s.intRange(1,2)):ce(r).saplingOf?s.next()<.45?Dd(i,t,e,n,s):!0:!1}function PS(i,t,e,n,s){const r=i.getBlock(t,e,n);if(r===T.FARMLAND||r===T.FARMLAND_WET){RS(i,t,e,n);return}if(uc(r)){CS(i,t,e,n,s);return}if(r===T.DEWBERRY_EMPTY){s.next()<wS&&hc(i,t,e,n);return}ce(r).saplingOf&&s.next()<ES&&Dd(i,t,e,n,s)}const IS={[Ad]:[1,0,0],[Td]:[-1,0,0],[nr]:[0,1,0],[oc]:[0,-1,0],[zo]:[0,0,1],[ac]:[0,0,-1]},DS={farmland_wet:"farmland"};function NS(i){return i==="seeds"?T.WHEAT_0:i==="water_bucket"?T.WATER:Ed(i)?yd(i):-1}function Nd(i){return zf.has(i)}function Ud(i){if(i.id!==T.AIR&&Nd(i.id))return{x:i.x,y:i.y,z:i.z};const[t,e,n]=IS[i.face]??[0,1,0];return{x:i.x+t,y:i.y+e,z:i.z+n}}function US(i,t){const e=Ch/2;return i.x<t.x+e&&i.x+1>t.x-e&&i.z<t.z+e&&i.z+1>t.z-e&&i.y<t.y+co&&i.y+1>t.y}function OS(i){const t=ce(i).name;return DS[t]??t}function Od(i,t,e){const n=ce(e),s=i.getBlock(t.x,t.y-1,t.z);return Bf.has(e)&&e!==T.DEWBERRY_EMPTY?s===T.FARMLAND||s===T.FARMLAND_WET?null:"wrong-soil":n.plantedOn?n.plantedOn.includes(OS(s))?null:"wrong-soil":n.needsSupport&&!Fe(s)?"no-support":null}function kS(i,t,e,n){const s=NS(e);if(s<0||s===T.AIR)return{ok:!1,reason:"not-placeable"};const r=Ud(t);if(r.y<1||r.y>=qt)return{ok:!1,reason:"out-of-world"};if(!Nd(i.getBlock(r.x,r.y,r.z)))return{ok:!1,reason:"occupied"};const o=Od(i,r,s);if(o)return{ok:!1,reason:o};if(Fe(s)&&US(r,n))return{ok:!1,reason:"player"};i.setBlock(r.x,r.y,r.z,s);const a=e==="water_bucket"?{item:"bucket",count:1}:null;return{ok:!0,x:r.x,y:r.y,z:r.z,blockId:s,give:a}}function FS(i,t,e){if(ci(e)?.kind==="hoe"){const n=i.getBlock(t.x,t.y+1,t.z);return(t.id===T.GRASS||t.id===T.DIRT)&&!Fe(n)?(i.setBlock(t.x,t.y,t.z,T.FARMLAND),{ok:!0,x:t.x,y:t.y,z:t.z,consume:!1,give:null,wear:1}):{ok:!1}}if(e==="bucket"){const n=Ud(t);return i.getBlock(n.x,n.y,n.z)!==T.WATER?{ok:!1}:(i.setBlock(n.x,n.y,n.z,T.AIR),{ok:!0,...n,consume:!0,give:{item:"water_bucket",count:1},wear:0})}return{ok:!1}}function BS(i,t,e){const n=i.getBlock(e.x,e.y,e.z);switch(ce(n).interactive){case"door":{const r=n===T.DOOR_CLOSED;return i.setBlock(e.x,e.y,e.z,r?T.DOOR_OPEN:T.DOOR_CLOSED),{kind:"door",open:r}}case"crafting":return{kind:"crafting"};case"chest":return{kind:"container",state:t.open("chest",e.x,e.y,e.z),at:e};case"furnace":return{kind:"container",state:t.open("furnace",e.x,e.y,e.z),at:e};case"fume":return{kind:"fume",at:e};case"bed":{const r={x:e.x+.5,y:e.y+1,z:e.z+.5};return i.isNight?(i.skipToMorning(),{kind:"bed",slept:!0,spawn:r}):{kind:"bed",slept:!1,spawn:r}}default:return null}}function zS(i,t,e,n){const s=[];let r=e+1;for(let o=0;o<8;o++,r++){const a=i.getBlock(t,r,n),l=ce(a);if(!l.needsSupport&&!l.plantedOn||!Od(i,{x:t,y:r,z:n},a))break;i.setBlock(t,r,n,T.AIR),s.push({x:t,y:r,z:n,id:a})}return s}const Ia=["head","chest","legs","feet"],HS=20;function GS(i,t,e){if(i<=0||e<=0)return 0;const n=Math.max(i/5,i-e/(t+8));return e*(Math.max(0,Math.min(HS,n))/25)}class Ao{slots=Ia.map(()=>null);get points(){let t=0;for(const e of this.slots)e&&(t+=Yr(e.item)?.points??0);return t}get toughness(){let t=0;for(const e of this.slots)e&&(t+=Yr(e.item)?.toughness??0);return t}accepts(t,e){return Yr(e.item)?.slot===Ia[t]}wear(){for(let t=0;t<this.slots.length;t++){const e=this.slots[t];if(!e)continue;const n=Ss(e.item);if(n<=0)continue;const s=(e.durability??n)-1;this.slots[t]=s<=0?null:{item:e.item,count:1,durability:s}}}clear(){for(let t=0;t<this.slots.length;t++)this.slots[t]=null}toJSON(){return{slots:this.slots.map(t=>t?t.durability===void 0?{item:t.item,count:1}:{item:t.item,count:1,durability:t.durability}:null)}}static fromJSON(t){const e=new Ao;if(!t||typeof t!="object")return e;const n=t.slots;if(!Array.isArray(n))return e;for(let s=0;s<e.slots.length;s++){const r=n[s];if(!r||typeof r.item!="string")continue;const o=Yr(r.item);if(!o||o.slot!==Ia[s])continue;const a=typeof r.durability=="number"&&Number.isFinite(r.durability)?Math.max(1,Math.min(o.durability,Math.floor(r.durability))):void 0;e.slots[s]=a===void 0?{item:r.item,count:1}:{item:r.item,count:1,durability:a}}return e}}function Ol(i,t,e){return Number.isFinite(i)?Math.max(t,Math.min(e,Math.floor(i))):t}function Da(i){const t=Ri(i);return t?t.tool?yf:t.stackSize:Wl}function gn(i,t,e){const n=Ss(i);if(n<=0)return{item:i,count:t};const s=e===void 0?n:Ol(e,1,n);return{item:i,count:t,durability:s}}function Yu(i){return gn(i.item,i.count,i.durability)}class To{slots;hotbarIndex;constructor(){this.slots=new Array(bf).fill(null),this.hotbarIndex=0}get selected(){return this.slots[this.hotbarIndex]??null}get selectedIndex(){return this.hotbarIndex}set selectedIndex(t){this.hotbarIndex=Ol(t,0,ke-1)}add(t){if(!Number.isFinite(t.count)||t.count<=0)return null;const e=Da(t.item),n=Ss(t.item)>0;let s=Math.floor(t.count);if(!n)for(let r=0;r<this.slots.length&&s>0;r++){const o=this.slots[r];if(!o||o.item!==t.item)continue;const a=e-o.count;if(a<=0)continue;const l=Math.min(a,s);this.slots[r]={item:o.item,count:o.count+l},s-=l}for(let r=0;r<this.slots.length&&s>0;r++){if(this.slots[r]!==null)continue;const o=Math.min(e,s);this.slots[r]=gn(t.item,o,t.durability),s-=o}return s<=0?null:gn(t.item,s,t.durability)}removeAt(t,e){const n=this.stackAt(t);if(!n||!Number.isFinite(e)||e<=0)return null;const s=Math.min(Math.floor(e),n.count);return s<=0?null:(this.slots[t]=s===n.count?null:gn(n.item,n.count-s,n.durability),gn(n.item,s,n.durability))}swap(t,e){if(!this.inBounds(t)||!this.inBounds(e)||t===e)return!1;const n=this.slots[t];return this.slots[t]=this.slots[e],this.slots[e]=n,!0}split(t){const e=this.stackAt(t);if(!e||e.count<2)return null;let n=-1;for(let o=0;o<this.slots.length;o++)if(o!==t&&this.slots[o]===null){n=o;break}if(n<0)return null;const s=Math.floor(e.count/2),r=gn(e.item,s,e.durability);return this.slots[t]=gn(e.item,e.count-s,e.durability),this.slots[n]=r,r}moveTo(t,e){if(!this.inBounds(t)||!this.inBounds(e)||t===e)return!1;const n=this.slots[t];if(!n)return!1;const s=this.slots[e];if(!s)return this.slots[e]=Yu(n),this.slots[t]=null,!0;if(s.item!==n.item)return!1;const r=Da(s.item)-s.count;if(r<=0)return!1;const o=Math.min(r,n.count);return this.slots[e]=gn(s.item,s.count+o,s.durability),this.slots[t]=o===n.count?null:gn(n.item,n.count-o,n.durability),!0}count(t){let e=0;for(const n of this.slots)n&&n.item===t&&(e+=n.count);return e}consume(t,e){if(!Number.isFinite(e))return!1;const n=Math.floor(e);if(n<=0)return!0;if(this.count(t)<n)return!1;let s=n;for(let r=0;r<this.slots.length&&s>0;r++){const o=this.slots[r];if(!o||o.item!==t)continue;const a=Math.min(o.count,s);this.slots[r]=a===o.count?null:gn(o.item,o.count-a,o.durability),s-=a}return!0}damage(t,e=1){const n=this.stackAt(t);if(!n||!Number.isFinite(e)||e<=0)return!1;const s=Ss(n.item);if(s<=0)return!1;const r=(n.durability??s)-Math.floor(e);return r<=0?(this.slots[t]=null,!0):(this.slots[t]={item:n.item,count:n.count,durability:r},!1)}toJSON(){return{slots:this.slots.map(t=>t?Yu(t):null),hotbarIndex:this.hotbarIndex}}static fromJSON(t){const e=new To,n=Array.isArray(t?.slots)?t.slots:[];for(let s=0;s<e.slots.length;s++){const r=n[s];if(!r||typeof r.item!="string"||typeof r.count!="number")continue;const o=Math.min(Math.floor(r.count),Da(r.item));if(o<=0)continue;const a=typeof r.durability=="number"?r.durability:void 0;e.slots[s]=gn(r.item,o,a)}return e.hotbarIndex=Ol(t?.hotbarIndex??0,0,ke-1),e}stackAt(t){return this.inBounds(t)?this.slots[t]:null}inBounds(t){return Number.isInteger(t)&&t>=0&&t<this.slots.length}}const VS=[{item:"bread",min:1,max:3,chance:.9},{item:"coal",min:2,max:6,chance:.8},{item:"stick",min:3,max:8,chance:.7},{item:"arrow",min:4,max:10,chance:.5},{item:"leather",min:1,max:2,chance:.4},{item:"ferrite_ingot",min:1,max:2,chance:.25},{item:"apple",min:1,max:2,chance:.35},{item:"torch",min:2,max:4,chance:.3}];function WS(i){const t=[];for(const e of VS){if(i.next()>=e.chance)continue;const n=i.intRange(e.min,e.max);n>0&&t.push({item:e.item,count:n})}return t}const XS=.3,YS=5,qS=.25;class $S{list=[];get count(){return this.list.length}shoot(t,e,n,s){const r=Math.hypot(e.x,e.y,e.z)||1,o={x:t.x,y:t.y,z:t.z,vx:e.x/r*n,vy:e.y/r*n,vz:e.z/r*n,damage:s,life:YS};return this.list.push(o),o}tick(t,e,n){const s=[];for(let r=this.list.length-1;r>=0;r--){const o=this.list[r];if(o.life-=e,o.life<=0){this.list.splice(r,1);continue}o.vy+=ps*XS*e;let a=Math.hypot(o.vx,o.vy,o.vz)*e;const l=Math.hypot(o.vx,o.vy,o.vz)||1,c={x:o.vx/l,y:o.vy/l,z:o.vz/l};let u=null;for(;a>0&&!u;){const h=Math.min(qS,a);if(a-=h,n(o,c,h)){u={x:o.x,y:o.y,z:o.z,blocked:!1};break}o.x+=c.x*h,o.y+=c.y*h,o.z+=c.z*h,Fe(t.getBlock(Math.floor(o.x),Math.floor(o.y),Math.floor(o.z)))&&(u={x:o.x,y:o.y,z:o.z,blocked:!0})}u&&(s.push(u),this.list.splice(r,1))}return s}clear(){this.list.length=0}}const qu=1.5,KS=5;function kd(i,t){const e=ce(i);if(e.hardness<0)return"unbreakable";const n=t?ci(t):void 0,s=!!n&&e.tool!==null&&n.kind===e.tool;return s&&n.tier<e.tier?"blocked":s?"fast":"slow"}function Fd(i,t){return ce(i).tier<=0?!0:kd(i,t)==="fast"}function jS(i,t){const e=ce(i),n=kd(i,t);if(n==="unbreakable"||n==="blocked")return Number.POSITIVE_INFINITY;if(e.hardness===0)return 0;if(n==="fast"){const r=ci(t??"")?.efficiency??1;return e.hardness*qu/r}const s=Fd(i,t)?qu:KS;return e.hardness*s}function ZS(i,t){return!t||!ci(t)?0:ce(i).hardness>0?1:0}class JS{target=null;progress=0;blocked=!1;reset(){this.target=null,this.progress=0,this.blocked=!1}tick(t,e,n,s,r){if(!e)return this.reset(),null;const o=t.getBlock(e.x,e.y,e.z);this.target!==null&&this.target.x===e.x&&this.target.y===e.y&&this.target.z===e.z&&this.target.id===o||(this.target={x:e.x,y:e.y,z:e.z,id:o},this.progress=0,this.blocked=!1);const l=r&&ce(o).hardness>=0?0:jS(o,n);if(!Number.isFinite(l)){const c=!this.blocked;return this.blocked=!0,c?{kind:"blocked",x:e.x,y:e.y,z:e.z,id:o}:null}return this.progress=l<=0?1:this.progress+s/l,this.progress<1?null:(t.setBlock(e.x,e.y,e.z,0),this.reset(),{kind:"broken",x:e.x,y:e.y,z:e.z,id:o,harvest:!r&&Fd(o,n),wear:r?0:ZS(o,n)})}}const $u=89*Math.PI/180,Na=1e-6,Ua=Math.PI*2;function QS(i){return((i+Math.PI)%Ua+Ua)%Ua-Math.PI}function tM(i){return Math.min($u,Math.max(-$u,i))}function $r(i,t,e,n){const s=1-Math.pow(e,n*Qs);return i+(t-i)*s}class eM{constructor(t,e,n={}){this.world=t,this.canFly=n.canFly??!1,this.state={position:{x:e.x,y:e.y,z:e.z},velocity:{x:0,y:0,z:0},yaw:0,pitch:0,onGround:!1,inWater:!1,flying:!1,sprinting:!1}}state;canFly;spawnAt(t){const{position:e,velocity:n}=this.state;e.x=t.x,e.y=t.y,e.z=t.z,n.x=0,n.y=0,n.z=0,this.state.onGround=!1,this.state.inWater=!1,this.state.flying=!1,this.state.sprinting=!1}look(t,e){this.state.yaw=QS(this.state.yaw+t),this.state.pitch=tM(this.state.pitch+e)}eyePosition(){const{x:t,y:e,z:n}=this.state.position;return{x:t,y:e+pf,z:n}}lookDirection(){const{yaw:t,pitch:e}=this.state,n=Math.cos(e);return{x:-Math.sin(t)*n,y:Math.sin(e),z:-Math.cos(t)*n}}move(t,e){if(!(e>0))return;let n=e;for(;n>Na;){const s=Math.min(n,Nf);this.step(t,s),n-=s}}step(t,e){const n=this.state,{position:s,velocity:r}=n;if(this.world.isBlockLoaded&&!this.world.isBlockLoaded(Math.floor(s.x),Math.floor(s.z))){r.x=0,r.y=0,r.z=0;return}n.flying=this.canFly&&t.fly;let o=t.forward,a=t.strafe;const l=Math.hypot(o,a);l>1&&(o/=l,a/=l),n.sprinting=t.sprint&&o>0&&!t.sneak&&!n.inWater;let c=mf;n.flying?c=wc:n.inWater?c=pr:n.sprinting&&(c=gf),t.sneak&&!n.flying&&(c*=Pf);const u=Math.sin(n.yaw),h=Math.cos(n.yaw),d=(-u*o+h*a)*c,f=(-h*o-u*a)*c;let g=If;if(n.flying||n.onGround?g=Ac:n.inWater&&(g=Ko),r.x=$r(r.x,d,g,e),r.z=$r(r.z,f,g,e),n.flying){const M=(t.jump?1:0)-(t.sneak?1:0);r.y=$r(r.y,M*wc,Ac,e)}else n.inWater?(r.y+=ps*Df*e,t.jump&&(r.y=$r(r.y,pr,Ko,e)),r.y*=Math.pow(Ko,e*Qs),r.y=Math.min(pr,Math.max(-pr,r.y))):(t.jump&&n.onGround&&(r.y=_f,n.onGround=!1),r.y+=ps*e,r.y*=Math.pow(vf,e*Qs),r.y=Math.max(Vl,r.y));const _=r.x*e,p=r.y*e,m=r.z*e,y=wd(this.world,s.x,s.y,s.z,_,p,m,{stepHeight:n.onGround&&!n.flying?Lh:0});Math.abs(y.x-s.x)+Na<Math.abs(_)&&(r.x=0),Math.abs(y.z-s.z)+Na<Math.abs(m)&&(r.z=0),(y.onGround&&r.y<0||y.hitCeiling&&r.y>0)&&(r.y=0),s.x=y.x,s.y=y.y,s.z=y.z,n.onGround=y.onGround,n.inWater=y.inWater}}const Ku=1,nM=5,iM=2,ju=1,sM=1,Zu=4,rM=17,Ju=4,oM=3,Oa=4,aM=.01,lM=.05,cM=.2,ka=5,uM=-16;function jn(i,t,e){return Math.min(e,Math.max(t,i))}function Gs(i,t){return typeof i=="number"&&Number.isFinite(i)?i:t}function hM(i){return i<=Tc?0:Math.ceil((i-Tc)*xf)}class Ro{health=Si;hunger=Mi;saturation=ka;air=Ei;exhaustion=0;armorPoints=0;armorToughness=0;lastDamage=null;peakY=null;drownTimer=0;starveTimer=0;regenTimer=0;get dead(){return this.health<=0}damage(t,e){if(this.dead||t<=0)return{amount:0,source:e,died:!1};const n=e==="mob"||e==="fall"?GS(this.armorPoints,this.armorToughness,t):0,s=Math.round((t-n)*10)/10;this.health=Math.max(0,this.health-s),this.lastDamage=e;const r={amount:s,source:e,died:this.dead};return n>0&&(r.absorbed=n),r}heal(t){this.dead||(this.health=jn(this.health+t,0,Si))}canEat(t){return!this.dead&&So(t)!==void 0&&this.hunger<Mi}eat(t){const e=So(t);return!e||!this.canEat(t)?!1:(this.hunger=jn(this.hunger+e.hunger,0,Mi),this.saturation=jn(this.saturation+e.saturation,0,this.hunger),!0)}addExhaustion(t){for(this.exhaustion+=t;this.exhaustion>=Oa;)this.exhaustion-=Oa,this.saturation>0?this.saturation=Math.max(0,this.saturation-1):this.hunger=Math.max(0,this.hunger-1)}tick(t,e){const n=[];if(this.dead||t<=0)return n;const s=o=>{o.amount>0&&n.push(o)};if(e.y<uM)return s(this.damage(this.health,"void")),n;if(e.flying||e.inWater?this.peakY=null:e.onGround?(this.peakY!==null&&s(this.damage(hM(this.peakY-e.y),"fall")),this.peakY=null):this.peakY=this.peakY===null?e.y:Math.max(this.peakY,e.y),e.headInWater){const o=Math.max(0,t-this.air/Ku);if(this.air=Math.max(0,this.air-Ku*t),o>0)for(this.drownTimer+=o;this.drownTimer>=ju&&!this.dead;)this.drownTimer-=ju,s(this.damage(iM,"drown"))}else this.air=Math.min(Ei,this.air+nM*t),this.drownTimer=0;let r=aM;if(e.moving&&(r+=e.sprinting?cM:lM),this.addExhaustion(r*t),this.hunger<=0)for(this.starveTimer+=t;this.starveTimer>=Zu&&!this.dead;)this.starveTimer-=Zu,s(this.damage(sM,"starve"));else this.starveTimer=0;if(this.hunger>rM&&this.health<Si&&!this.dead)for(this.regenTimer+=t;this.regenTimer>=Ju&&this.health<Si;)this.regenTimer-=Ju,this.heal(1),this.addExhaustion(oM);else this.regenTimer=0;return n}respawn(){this.health=Rc,this.hunger=Mi,this.saturation=ka,this.air=Ei,this.exhaustion=0,this.lastDamage=null,this.peakY=null,this.drownTimer=0,this.starveTimer=0,this.regenTimer=0}toJSON(){return{health:this.health,hunger:this.hunger,saturation:this.saturation,air:this.air,exhaustion:this.exhaustion}}static fromJSON(t){const e=new Ro;if(!t||typeof t!="object")return e;const n=t;return e.health=jn(Gs(n.health,Si),0,Si),e.health<=0&&(e.health=Rc),e.hunger=jn(Gs(n.hunger,Mi),0,Mi),e.saturation=jn(Gs(n.saturation,ka),0,e.hunger),e.air=jn(Gs(n.air,Ei),0,Ei),e.exhaustion=jn(Gs(n.exhaustion,0),0,Oa),e}}function dM(i){const t=[];for(let e=0;e<i.slots.length;e++){const n=i.slots[e];n&&(t.push(n),i.slots[e]=null)}return t}class Cn extends Error{}const fM=/^-?\d+,-?\d+$/;function Bd(i){const t=[];let e=0;for(;e<i.length;){const n=i[e];let s=1;for(;e+s<i.length&&i[e+s]===n&&s<255;)s++;t.push(s,n),e+=s}return Uint8Array.from(t)}function pM(i,t){if(i.length%2!==0)throw new Cn("Corrupt chunk data");const e=new Uint8Array(t);let n=0;for(let s=0;s<i.length;s+=2){const r=i[s];if(r===0||n+r>t)throw new Cn("Corrupt chunk data");e.fill(i[s+1],n,n+r),n+=r}if(n!==t)throw new Cn("Corrupt chunk data");return e}function zd(i){let t="";for(let e=0;e<i.length;e+=32768)t+=String.fromCharCode(...i.subarray(e,e+32768));return btoa(t)}function mM(i){let t;try{t=atob(i)}catch{throw new Cn("Corrupt chunk data")}const e=new Uint8Array(t.length);for(let n=0;n<t.length;n++)e[n]=t.charCodeAt(n);return e}class gM{cache=new Map;encoded=0;encode(t,e,n){const s=this.cache.get(t);if(s&&s.revision===e)return s.text;const r=zd(Bd(n));return this.cache.set(t,{revision:e,text:r}),this.encoded++,r}get encodedCount(){return this.encoded}retain(t){const e=new Set(t);for(const n of[...this.cache.keys()])e.has(n)||this.cache.delete(n)}}function _M(i,t){const e={};for(const n of[...i.chunks.keys()].sort()){const s=i.chunks.get(n);s&&(e[n]=t?t(n,s):zd(Bd(s)))}return{version:df,seed:i.seed>>>0,mode:i.mode,time:Math.max(0,Math.floor(i.time)),player:i.player,stats:i.stats,inventory:i.inventory,armor:i.armor??null,containers:i.containers,entities:i.entities,chunks:e}}function as(i){return typeof i=="number"&&Number.isFinite(i)}function vM(i){if(!i||typeof i!="object")throw new Cn("Missing player");const t=i;if(![t.x,t.y,t.z].every(as))throw new Cn("Invalid player position");const e=t.respawn,n=e&&[e.x,e.y,e.z].every(as)?{x:e.x,y:e.y,z:e.z}:null;return{x:t.x,y:t.y,z:t.z,yaw:as(t.yaw)?t.yaw:0,pitch:as(t.pitch)?t.pitch:0,respawn:n}}function xM(i){if(!i||typeof i!="object")throw new Cn("Save is not an object");const t=i;switch(t.version){case 1:{if(!as(t.seed))throw new Cn("Invalid seed");const e={};if(t.chunks&&typeof t.chunks=="object")for(const[n,s]of Object.entries(t.chunks))fM.test(n)&&typeof s=="string"&&(e[n]=s);return{version:1,seed:t.seed>>>0,mode:t.mode==="creative"?"creative":"survival",time:as(t.time)&&t.time>=0?Math.floor(t.time):0,player:vM(t.player),stats:t.stats??null,inventory:t.inventory??null,armor:t.armor??null,containers:t.containers??[],entities:t.entities??[],chunks:e}}default:throw new Cn(`Unsupported save version: ${String(t.version)}`)}}function SM(i){const t=new Map;for(const[e,n]of Object.entries(i.chunks))t.set(e,pM(mM(n),to));return t}function MM(i,t){return`world:${i>>>0}:${t}`}async function bM(i,t,e){await i.put(t,JSON.stringify(e))}async function yM(i,t){const e=await i.get(t);if(e===null)return null;let n;try{n=JSON.parse(e)}catch{throw new Cn("Save is not valid JSON")}return xM(n)}class EM{constructor(t,e){this.intervalSeconds=t,this.save=e}elapsed=0;saving=!1;tick(t){return this.elapsed+=t,this.elapsed<this.intervalSeconds||this.saving?!1:(this.elapsed=0,this.now(),!0)}async now(){if(!this.saving){this.saving=!0;try{await this.save()}finally{this.saving=!1}}}}const K=wn,wM=[[2,2],[13,2],[2,13],[13,13]];function AM(i){let t=2166136261;for(let e=0;e<i.length;e++)t^=i.charCodeAt(e),t=Math.imul(t,16777619);return t>>>0}function he(i){return new Ci(AM(i))}function Wt(i,t,e,n){i.fillStyle=n,i.fillRect(t,e,K,K)}function N(i,t,e,n,s,r,o,a){const l=Math.max(0,n),c=Math.max(0,s),u=Math.min(K,n+r),h=Math.min(K,s+o);u<=l||h<=c||(i.fillStyle=a,i.fillRect(t+l,e+c,u-l,h-c))}function _t(i,t,e,n,s,r){N(i,t,e,n,s,1,1,r)}function ui(i,t,e,n,s,r){for(let o=0;o<r;o++)_t(i,t,e,n.nextInt(K),n.nextInt(K),n.pick(s))}function Rs(i,t,e,n,s,r){for(let o=0;o<K;o++)for(let a=0;a<K;a++)n.next()<r&&_t(i,t,e,a,o,n.pick(s))}function Ge(i,t,e,n){return{name:i,draw(s,r,o){Wt(s,r,o,t),Rs(s,r,o,he(i),e,n)}}}function Vs(i,t,e,n,s){return{name:i,draw(r,o,a){Wt(r,o,a,t);const l=he(i);for(let c=0;c<4;c++){const u=c*4,h=c%2===0?0:-4;for(let d=h;d<K;d+=8)N(r,o,a,d,u,7,3,e),N(r,o,a,d,u+2,7,1,n),l.chance(.5)&&N(r,o,a,d,u,7,1,s)}}}}function TM(i,t,e){return{name:i,draw(n,s,r){Wt(n,s,r,t);const o=he(i);for(let a=0;a<4;a++){const l=a*4,c=a%2===0?0:-3;for(let u=c;u<K+1;u+=7){const h=5+o.nextInt(2);N(n,s,r,u,l,h,3,o.pick(e)),N(n,s,r,u,l,h,1,o.pick(e))}}}}}function rs(i,t,e,n,s,r){return{name:i,draw(o,a,l){Wt(o,a,l,t);const c=he(i);Rs(o,a,l,c,e,.28);const u=4+c.nextInt(3);for(let h=0;h<u;h++){const d=1+c.nextInt(11),f=1+c.nextInt(11),g=2+c.nextInt(2),_=2+c.nextInt(2);N(o,a,l,d,f,g,_,n),N(o,a,l,d,f,g,1,s),c.chance(.5)&&_t(o,a,l,d,f,r)}}}}function Qu(i,t,e,n,s,r){return{name:i,draw(o,a,l){Wt(o,a,l,t);const c=he(i);Rs(o,a,l,c,e,.35);for(let u=0;u<K;u++){const h=3+c.nextInt(3);N(o,a,l,u,0,1,h,n),_t(o,a,l,u,h,s),c.chance(.3)&&_t(o,a,l,u,1,r)}}}}function RM(i,t,e,n,s){return{name:i,draw(r,o,a){Wt(r,o,a,t);const l=he(i);for(let c=0;c<4;c++){const u=c*4;N(r,o,a,0,u+3,K,1,e);for(let h=0;h<3;h++){const d=l.nextInt(K-3);N(r,o,a,d,u+l.nextInt(3),2+l.nextInt(3),1,l.chance(.5)?n:s)}}}}}function Fa(i,t,e,n){return{name:i,draw(s,r,o){Wt(s,r,o,t);const a=he(i);for(let l=0;l<K;l++){const c=a.next();c<.3?N(s,r,o,l,a.nextInt(8),1,6+a.nextInt(10),e):c<.55&&N(s,r,o,l,a.nextInt(10),1,4+a.nextInt(8),n)}N(s,r,o,0,0,1,K,e),N(s,r,o,K-1,0,1,K,n)}}}function Ba(i,t,e,n,s){return{name:i,draw(r,o,a){Wt(r,o,a,s);for(let l=0;l<K;l++)for(let c=0;c<K;c++){const u=c-7.5,h=l-7.5,d=Math.sqrt(u*u+h*h);d<=6.5&&(d<1.5?_t(r,o,a,c,l,n):_t(r,o,a,c,l,Math.floor(d)%2===0?t:e))}}}}function Kr(i,t,e,n){return{name:i,draw(s,r,o){Wt(s,r,o,t);const a=he(i);for(let l=0;l<K;l+=2)for(let c=l/2%2;c<K;c+=2)a.chance(.75)&&N(s,r,o,c,l,2,2,e);ui(s,r,o,a,[n],8)}}}function th(i,t,e,n,s){return{name:i,draw(r,o,a){Wt(r,o,a,t);const l=he(i);for(let c=0;c<K;c+=2)N(r,o,a,0,c,K,1,l.chance(.5)?e:n);for(const[c,u]of wM)_t(r,o,a,c,u,e),_t(r,o,a,c+1,u,n);s&&ui(r,o,a,l,[s],10)}}}function eh(i,t,e,n,s){return{name:i,draw(r,o,a){Wt(r,o,a,t),N(r,o,a,0,0,K,1,e),N(r,o,a,0,K-1,K,1,e),N(r,o,a,0,0,1,K,e),N(r,o,a,K-1,0,1,K,e),N(r,o,a,2,2,1,5,n),N(r,o,a,3,2,1,3,n),N(r,o,a,11,9,1,4,n),s&&(_t(r,o,a,11,3,s),_t(r,o,a,10,3,s),_t(r,o,a,12,3,s),_t(r,o,a,11,2,s),_t(r,o,a,11,4,s),_t(r,o,a,4,11,s),_t(r,o,a,3,11,s),_t(r,o,a,5,11,s))}}}function CM(i){return{name:i,draw(t,e,n){Wt(t,e,n,"#3a6ea8");const s=he(i);for(let r=0;r<10;r++){const o=s.nextInt(K),a=s.nextInt(K-6);N(t,e,n,a,o,4+s.nextInt(4),1,s.chance(.5)?"#4a80bc":"#2e5c90")}for(let r=0;r<6;r++)_t(t,e,n,s.nextInt(K),s.nextInt(K),"#5a90cc")}}}function LM(i){return{name:i,draw(t,e,n){Wt(t,e,n,"#8a8378");const s=he(i);for(let r=0;r<24;r++){const o=s.nextInt(K),a=s.nextInt(K);N(t,e,n,o,a,1+s.nextInt(2),1+s.nextInt(2),s.pick(["#9a938a","#6e675e","#7d766d","#a49c92"]))}}}}function PM(i){return{name:i,draw(t,e,n){Wt(t,e,n,"#d8c890"),N(t,e,n,0,2,K,1,"#d0bc7e"),N(t,e,n,0,5,K,2,"#e0d0a0"),N(t,e,n,0,9,K,1,"#cbb878"),N(t,e,n,0,12,K,2,"#d5c488"),ui(t,e,n,he(i),["#efe4b8"],12)}}}function IM(i){return{name:i,draw(t,e,n){Wt(t,e,n,"#3a3a3e");const s=he(i);for(let r=0;r<16;r++)N(t,e,n,s.nextInt(14),s.nextInt(14),2+s.nextInt(2),2+s.nextInt(2),s.pick(["#2a2a2e","#4a4a50","#323236","#444448"]))}}}function DM(i){return{name:i,draw(t,e,n){Wt(t,e,n,"#a8d4f0");const s=he(i);for(let r=0;r<9;r++)N(t,e,n,s.nextInt(8),s.nextInt(K),4+s.nextInt(6),1,s.chance(.5)?"#c2e4f8":"#8fc0e0");ui(t,e,n,s,["#e0f2fc"],8)}}}function NM(i){return{name:i,draw(t,e,n){Wt(t,e,n,"#1f9a90");const s=he(i);for(let r=0;r<5;r++)N(t,e,n,1+s.nextInt(10),1+s.nextInt(10),3+s.nextInt(4),3+s.nextInt(4),s.pick(["#2ab5a8","#188a80","#35c8ba"]));ui(t,e,n,s,["#8af0e4","#d0fff8"],10)}}}function UM(i){return{name:i,draw(t,e,n){const s=he(i);for(let r=0;r<K;r++)for(let o=0;o<K;o++){const a=(o*2+r)%7,l=a<1?"#c8bef8":a<3?"#8a7ad0":a<5?"#6a5ab0":"#5a4a9a";_t(t,e,n,o,r,l)}ui(t,e,n,s,["#e0d8ff"],8)}}}function OM(i){return{name:i,draw(t,e,n){const s=he(i);for(let r=0;r<K;r++)for(let o=0;o<K;o++){const a=(o+r)%6,l=a<1?"#f0d060":a<3?"#d4af37":a<5?"#b89028":"#c9a430";_t(t,e,n,o,r,l)}ui(t,e,n,s,["#ffe890"],6)}}}function kM(i){return{name:i,draw(t,e,n){Wt(t,e,n,"#ff9a30");const s=he(i);Rs(t,e,n,s,["#ffb45a","#ff8a20","#ffd070"],.5),N(t,e,n,4,4,8,8,"#ffd060"),N(t,e,n,6,6,4,4,"#fff0c0")}}}function FM(i){return{name:i,draw(t,e,n){Wt(t,e,n,"#55585a");const s=he(i);for(let r=0;r<4;r++){const o=r*4,a=r%2===0?0:-4;for(let l=a;l<K;l+=8)N(t,e,n,l,o,7,3,s.chance(.5)?"#7d7d7b":"#787876"),N(t,e,n,l,o+2,7,1,"#686866")}for(let r=0;r<9;r++)N(t,e,n,s.nextInt(12),s.nextInt(12),2+s.nextInt(3),2+s.nextInt(2),s.pick(["#4a8a34","#3f7a2c","#5a9a44"]))}}}function BM(i){return{name:i,draw(t,e,n){Wt(t,e,n,"#4a2e22");const s=he(i);Rs(t,e,n,s,["#5a3830","#3a2218","#63382c"],.4);for(let r=0;r<6;r++){let o=s.nextInt(K),a=s.nextInt(K);const l=4+s.nextInt(5);for(let c=0;c<l;c++)_t(t,e,n,o,a,s.chance(.5)?"#ff7a2f":"#ffb45a"),o+=s.nextInt(3)-1,a+=s.nextInt(2)}}}}function zM(i){return{name:i,draw(t,e,n){Wt(t,e,n,"#5a3226");const s=he(i);for(let r=0;r<4;r++){const o=r*4,a=r%2===0?0:-4;for(let l=a;l<K;l+=8)N(t,e,n,l,o,7,3,s.chance(.5)?"#6a3c2c":"#5f3628"),N(t,e,n,l,o+2,7,1,"#3f2418")}for(let r=0;r<4;r++){let o=s.nextInt(K),a=s.nextInt(K);const l=3+s.nextInt(4);for(let c=0;c<l;c++)_t(t,e,n,o,a,s.chance(.5)?"#ff7a2f":"#ffb45a"),o+=s.nextInt(3)-1,a+=s.nextInt(2)}}}}function nh(i,t,e,n){return{name:i,draw(s,r,o){Wt(s,r,o,t);for(const a of[2,6,10,14])N(s,r,o,0,a,K,1,e);ui(s,r,o,he(i),[n],18)}}}function ih(i,t){return{name:i,draw(e,n,s){Wt(e,n,s,"#6a6a6e");const r=he(i);if(Rs(e,n,s,r,["#5f5f63","#757579"],.3),N(e,n,s,4,5,8,8,"#2e2e32"),N(e,n,s,5,4,6,1,"#2e2e32"),t)N(e,n,s,5,9,6,4,"#ff7a20"),N(e,n,s,6,8,4,4,"#ff9a30"),N(e,n,s,7,10,2,3,"#ffd060"),_t(e,n,s,8,11,"#fff0b0"),_t(e,n,s,5,8,"#ffb45a"),_t(e,n,s,10,8,"#ffb45a");else for(let o=7;o<13;o+=2)N(e,n,s,5,o,6,1,"#1f1f23")}}}function HM(i){return{name:i,draw(t,e,n){Wt(t,e,n,"#4a9a3a");const s=he(i);for(let r=2;r<K;r+=4)N(t,e,n,r,0,1,K,"#3a7e2c");for(let r=0;r<K;r++)s.chance(.25)&&_t(t,e,n,r,s.nextInt(K),"#e8e0a0")}}}function jr(i,t){return{name:i,draw(e,n,s){const r=he(i),o=t===3?"#b08830":t===2?"#7aa83c":"#5aa03c",a=t===3?"#d8b040":"#8ab040",l=3+t;for(let c=0;c<l;c++){const u=2+c*3+r.nextInt(2),h=3+t*3+r.nextInt(3),d=K-h;N(e,n,s,u,d,1,h,o),t>=2&&(N(e,n,s,u-1,d,3,2,a),t===3&&_t(e,n,s,u,d-1,a))}}}}function za(i,t,e){return(n,s,r)=>{N(n,s,r,7,8,2,8,"#3f7a2c"),N(n,s,r,5,10,2,1,"#3f7a2c"),N(n,s,r,9,12,2,1,"#3f7a2c"),N(n,s,r,5,3,6,5,i),N(n,s,r,6,2,4,7,i),N(n,s,r,6,4,2,2,t),N(n,s,r,7,5,2,2,e)}}function sh(i,t,e,n){return(s,r,o)=>{N(s,r,o,7,9,2,7,n),N(s,r,o,4,5,8,4,i),N(s,r,o,5,4,6,1,i),N(s,r,o,5,5,3,1,t),_t(s,r,o,6,6,e),_t(s,r,o,9,6,e),_t(s,r,o,8,7,e)}}function Ha(i,t,e,n){return(s,r,o)=>{N(s,r,o,7,9,2,7,i),n?(N(s,r,o,7,1,2,2,t),N(s,r,o,6,3,4,2,t),N(s,r,o,5,5,6,2,t),N(s,r,o,4,7,8,3,t),_t(s,r,o,6,4,e),_t(s,r,o,9,6,e),_t(s,r,o,5,8,e)):(N(s,r,o,5,3,6,1,t),N(s,r,o,4,4,8,2,t),N(s,r,o,3,6,10,4,t),N(s,r,o,5,10,6,1,t),_t(s,r,o,6,5,e),_t(s,r,o,9,6,e),_t(s,r,o,5,8,e),_t(s,r,o,10,7,e))}}function rh(i){return(t,e,n)=>{N(t,e,n,3,6,10,5,"#3f7a2c"),N(t,e,n,5,4,6,2,"#4a8e30"),N(t,e,n,4,11,8,2,"#356a24"),i?(_t(t,e,n,5,7,"#4060d0"),_t(t,e,n,6,7,"#4060d0"),_t(t,e,n,9,8,"#6080f0"),_t(t,e,n,10,8,"#6080f0"),_t(t,e,n,7,10,"#4060d0"),_t(t,e,n,8,10,"#7090ff")):(N(t,e,n,6,6,1,2,"#7a5a34"),N(t,e,n,9,7,1,2,"#7a5a34"),_t(t,e,n,7,9,"#8a6a44"))}}function GM(i,t,e){N(i,t,e,5,0,6,2,"#d0ecfa"),N(i,t,e,6,2,4,3,"#d0ecfa"),N(i,t,e,7,5,2,5,"#d0ecfa"),N(i,t,e,7,10,1,3,"#d0ecfa"),N(i,t,e,6,2,1,4,"#ffffff"),N(i,t,e,9,1,1,4,"#a8d0e8")}function VM(i,t,e){Wt(i,t,e,"#3f8a30"),N(i,t,e,1,1,14,14,"#4a9a3a"),N(i,t,e,3,3,10,10,"#56a844"),N(i,t,e,6,6,4,4,"#66b854"),_t(i,t,e,7,7,"#8ad078")}function WM(i,t,e){const n=[[3,9,"#4a8e30"],[5,12,"#5aa03c"],[7,10,"#3f7a2c"],[8,13,"#5aa03c"],[10,11,"#4a8e30"],[12,8,"#3f7a2c"]];for(const[s,r,o]of n)N(i,t,e,s,K-r,1,r,o)}function XM(i,t,e){N(i,t,e,7,10,1,6,"#7a5a34"),N(i,t,e,3,8,1,4,"#6a4c2a"),N(i,t,e,11,7,1,5,"#6a4c2a"),N(i,t,e,5,5,1,4,"#7a5a34"),N(i,t,e,9,4,1,5,"#7a5a34"),N(i,t,e,6,4,1,3,"#8a6a44"),N(i,t,e,10,5,1,3,"#8a6a44")}function YM(i,t,e){N(i,t,e,7,7,2,9,"#7a5a34"),N(i,t,e,7,7,1,9,"#8a6a44"),N(i,t,e,6,3,4,4,"#ff9a30"),N(i,t,e,7,2,2,3,"#ffd060"),N(i,t,e,7,1,2,1,"#fff0b0"),_t(i,t,e,6,4,"#ffc860"),_t(i,t,e,9,4,"#ff7a20")}function qM(i,t,e){N(i,t,e,7,8,2,8,"#9adfd8"),N(i,t,e,4,4,8,4,"#5ec4d4"),N(i,t,e,5,3,6,1,"#5ec4d4"),N(i,t,e,5,5,6,2,"#7ad8e4"),_t(i,t,e,6,5,"#c8f6ff"),_t(i,t,e,9,6,"#c8f6ff"),_t(i,t,e,7,6,"#e6fbff"),_t(i,t,e,7,12,"#7ad8e4")}function $M(i,t,e){Wt(i,t,e,"#5f5f63"),N(i,t,e,1,1,14,14,"#4a4a4e"),N(i,t,e,2,2,12,12,"#5a5a5e"),N(i,t,e,6,6,4,4,"#3a3a3e")}function KM(i,t,e){Wt(i,t,e,"#6a6a6e"),N(i,t,e,0,0,K,1,"#5a5a5e"),N(i,t,e,0,5,K,1,"#565656"),N(i,t,e,0,10,K,1,"#565656"),N(i,t,e,3,3,10,2,"#4a4a4e"),N(i,t,e,3,12,10,2,"#4a4a4e")}function jM(i,t,e){Wt(i,t,e,"#b08c54"),N(i,t,e,0,5,K,1,"#6e4f2e"),N(i,t,e,0,10,K,1,"#6e4f2e"),N(i,t,e,5,0,1,K,"#6e4f2e"),N(i,t,e,10,0,1,K,"#6e4f2e"),N(i,t,e,1,1,3,3,"#c0a070"),N(i,t,e,11,11,4,4,"#9a7a48")}function ZM(i,t,e){Wt(i,t,e,"#a8804c"),N(i,t,e,0,5,K,1,"#8a6839"),N(i,t,e,0,11,K,1,"#8a6839"),N(i,t,e,2,6,12,6,"#7a5a34"),N(i,t,e,3,7,10,1,"#b0b0b8"),N(i,t,e,12,6,2,3,"#6e4f2e")}function JM(i,t,e){Wt(i,t,e,"#b08c54"),N(i,t,e,0,5,K,1,"#8a6839"),N(i,t,e,0,11,K,1,"#8a6839"),N(i,t,e,2,3,5,4,"#9a7a48"),N(i,t,e,9,3,5,4,"#9a7a48"),N(i,t,e,2,3,5,1,"#6e4f2e"),N(i,t,e,9,3,5,1,"#6e4f2e"),_t(i,t,e,4,5,"#d8c070"),_t(i,t,e,11,5,"#d8c070")}function QM(i,t,e){Wt(i,t,e,"#a8804c"),N(i,t,e,0,0,K,1,"#6e4f2e"),N(i,t,e,0,K-1,K,1,"#6e4f2e"),N(i,t,e,0,0,1,K,"#6e4f2e"),N(i,t,e,K-1,0,1,K,"#6e4f2e"),N(i,t,e,0,7,K,1,"#8a6839"),N(i,t,e,1,1,3,1,"#c8a06a")}function tb(i,t,e){Wt(i,t,e,"#a8804c"),N(i,t,e,0,5,K,1,"#8a6839"),N(i,t,e,0,11,K,1,"#8a6839"),N(i,t,e,0,7,K,3,"#5a4a3a"),_t(i,t,e,2,8,"#8a7a60"),_t(i,t,e,13,8,"#8a7a60")}function eb(i,t,e){Wt(i,t,e,"#a8804c"),N(i,t,e,0,5,K,1,"#8a6839"),N(i,t,e,0,11,K,1,"#8a6839"),N(i,t,e,0,7,K,3,"#5a4a3a"),_t(i,t,e,2,8,"#8a7a60"),_t(i,t,e,13,8,"#8a7a60"),N(i,t,e,6,6,4,5,"#c8a840"),N(i,t,e,7,9,2,2,"#3a2a14")}function nb(i,t,e){Wt(i,t,e,"#c03040"),N(i,t,e,0,0,K,4,"#f0f0e8"),N(i,t,e,0,3,K,1,"#d0d0c8"),N(i,t,e,0,4,K,1,"#a02838");for(const n of[4,8,12])N(i,t,e,n,5,1,11,"#b02838")}function ib(i,t,e){Wt(i,t,e,"#c03040"),N(i,t,e,0,0,K,2,"#f0f0e8"),N(i,t,e,0,12,K,1,"#a02838"),N(i,t,e,0,13,K,3,"#6e4f2e"),N(i,t,e,1,13,2,3,"#5a3f24"),N(i,t,e,13,13,2,3,"#5a3f24")}function sb(i,t,e){Wt(i,t,e,"#8a6a3e"),N(i,t,e,5,0,1,K,"#6e4f2e"),N(i,t,e,10,0,1,K,"#6e4f2e"),N(i,t,e,0,3,K,2,"#6e4f2e"),N(i,t,e,0,11,K,2,"#6e4f2e"),N(i,t,e,11,7,2,2,"#c8a840"),N(i,t,e,1,0,4,1,"#a88858")}function rb(i,t,e){Wt(i,t,e,"#5a5a5e"),N(i,t,e,1,1,14,14,"#6a6a70");for(const n of[4,7,10])N(i,t,e,3,n,10,2,"#2a2a2e");_t(i,t,e,1,1,"#8a8a90"),_t(i,t,e,14,1,"#8a8a90"),_t(i,t,e,1,14,"#8a8a90"),_t(i,t,e,14,14,"#8a8a90")}function ob(i,t,e){Wt(i,t,e,"#3f3f46"),N(i,t,e,0,0,K,2,"#6a6a70"),N(i,t,e,0,K-2,K,2,"#6a6a70"),N(i,t,e,0,0,2,K,"#6a6a70"),N(i,t,e,K-2,0,2,K,"#6a6a70"),N(i,t,e,2,2,12,12,"#ffd070"),N(i,t,e,4,4,8,8,"#ffe8a0"),N(i,t,e,7,0,2,K,"#5a5a60"),N(i,t,e,0,7,K,2,"#5a5a60"),_t(i,t,e,2,2,"#8a8a90"),_t(i,t,e,13,13,"#8a8a90")}function ab(i,t,e){Wt(i,t,e,"#2e1f14");const n=he("campfire_top");for(let s=0;s<14;s++)_t(i,t,e,n.nextInt(K),n.nextInt(K),n.pick(["#ff7a2f","#ffb45a","#ff5a10"]));N(i,t,e,2,6,12,3,"#6e4f2e"),N(i,t,e,6,2,3,12,"#6e4f2e"),N(i,t,e,2,6,12,1,"#8a6a3e"),N(i,t,e,6,2,1,12,"#8a6a3e")}function lb(i,t,e){Wt(i,t,e,"#3a2a1c"),N(i,t,e,1,10,14,3,"#6e4f2e"),N(i,t,e,2,13,12,3,"#5a3f24"),N(i,t,e,1,10,14,1,"#8a6a3e"),N(i,t,e,3,9,10,1,"#ff7a2f"),N(i,t,e,4,4,8,5,"#ff9a30"),N(i,t,e,6,2,4,4,"#ffd060"),N(i,t,e,7,1,2,2,"#fff0b0"),_t(i,t,e,5,9,"#ffb45a"),_t(i,t,e,10,9,"#ffb45a")}function cb(i){const t={};for(let e=0;e<i.length;e++)t[i[e].name]=e;return t}const kl=[{name:"air",draw:()=>{}},Ge("stone","#7a7a78",["#6e6e6c","#878785","#747472"],.35),Ge("grass_top","#5d9b3a",["#528f32","#6bb044","#4c8630"],.4),Ge("dirt","#8a6247",["#75523a","#966e50","#6b4a34"],.35),Qu("grass_side","#8a6247",["#75523a","#966e50"],"#5d9b3a","#4a8030","#6bb044"),TM("cobblestone","#4f4f4f",["#8a8a88","#7b7b79","#969694"]),Ge("sand","#dbcf98",["#d0c288","#e4d9a8","#c8b87c"],.3),Ge("sandstone_top","#d8c890",["#d0bc82","#e2d29c"],.25),PM("sandstone_side"),LM("gravel"),CM("water"),Ba("log_top","#a3814f","#8f6f42","#6e5433","#6b4a2c"),Fa("log_side","#6e4f2e","#5a3f24","#7d5c38"),Ge("leaves","#3f8f2f",["#2f7a24","#4fa03c","#27661e"],.5),RM("planks","#b08c54","#8a6a3e","#a07c48","#c0a06a"),eh("glass","#d4ecf6","#a8c8dc","#ffffff"),rs("coal_ore","#7a7a78",["#6e6e6c","#878785"],"#2e2e30","#44444a","#6a6a70"),rs("copper_ore","#7a7a78",["#6e6e6c","#878785"],"#b06a3a","#c88450","#e0a070"),rs("ferrite_ore","#7a7a78",["#6e6e6c","#878785"],"#8a939d","#b0b8c0","#d8e0e8"),rs("aurum_ore","#7a7a78",["#6e6e6c","#878785"],"#b89028","#d4af37","#ffe890"),rs("aetherite_ore","#7a7a78",["#6e6e6c","#878785"],"#2ab5a8","#5ad8c8","#d0fff4"),rs("ember_ore","#7a7a78",["#6e6e6c","#878785"],"#ff6a1f","#ff9a30","#ffe0a0"),IM("bedrock"),Ge("snow","#f2f6fa",["#e4ecf4","#ffffff"],.3),Qu("snow_grass_side","#8a6247",["#75523a","#966e50"],"#f2f6fa","#d8e4ee","#ffffff"),DM("ice"),Ge("permafrost","#7a8a96",["#6a7a86","#8a9aa6","#728290"],.3),eh("frostglass","#dcebf6","#b0cfe0","#ffffff","#a8c8dc"),NM("glowcrystal"),{name:"icicle",draw:GM},{name:"cactus_top",draw:VM},HM("cactus_side"),{name:"tall_grass",draw:WM},{name:"flower_red",draw:za("#d83a3a","#f06050","#f0d040")},{name:"flower_yellow",draw:za("#f0c832","#ffe070","#c07820")},{name:"flower_blue",draw:za("#3a6ad8","#6090f0","#f0e040")},{name:"mushroom_red",draw:sh("#d83a3a","#f06050","#f0f0e8","#e8dcc8")},{name:"mushroom_brown",draw:sh("#8a5a3a","#a07048","#6a4428","#d8c8a8")},{name:"dead_bush",draw:XM},{name:"torch",draw:YM},{name:"crafting_table_top",draw:jM},{name:"crafting_table_side",draw:ZM},{name:"crafting_table_front",draw:JM},{name:"furnace_top",draw:$M},{name:"furnace_side",draw:KM},ih("furnace_front",!1),ih("furnace_front_lit",!0),{name:"chest_top",draw:QM},{name:"chest_side",draw:tb},{name:"chest_front",draw:eb},{name:"bed_top",draw:nb},{name:"bed_side",draw:ib},{name:"door",draw:sb},Vs("bricks","#8a7a70","#9e4a3a","#7a3428","#b05848"),Vs("stone_bricks","#55585a","#7d7d7b","#686866","#8a8a88"),FM("mossy_stone"),Vs("sandstone_bricks","#b8a878","#d0c090","#bcaa7c","#e0d2a4"),BM("emberstone"),zM("emberstone_bricks"),Ge("rustrock","#7a5040",["#8f6050","#634030","#a06848"],.4),Vs("rustrock_bricks","#5a3828","#8a5a48","#6a4232","#a07058"),kM("emberlight"),Ge("understone","#4a4452",["#3a3442","#5a5464","#524c5c"],.35),Vs("understone_bricks","#38323f","#524c5c","#443e4c","#5e5870"),{name:"fume_vent",draw:rb},nh("farmland","#5a3e28","#422e1c","#6a4c32"),nh("farmland_wet","#42301c","#2e2012","#5a4430"),jr("wheat_0",0),jr("wheat_1",1),jr("wheat_2",2),jr("wheat_3",3),Ba("log_pine_top","#8a6a48","#75583a","#5a4428","#4e3824"),Fa("log_pine_side","#4e3824","#3e2c1a","#5e4830"),Ge("leaves_pine","#2a6a4a",["#1e5538","#358058","#225e42"],.5),Ba("log_dune_top","#c8a868","#b89858","#9a7c40","#a88848"),Fa("log_dune_side","#a88848","#987838","#b89858"),Ge("leaves_dune","#7a9a3a",["#6a8a2e","#8aaa48","#5e7e28"],.5),Ge("clay","#a8a098",["#b8b0a8","#989088","#b0a8a0"],.25),Ge("voidrock","#1e1a28",["#141020","#2a2438","#4a3a6a"],.35),Kr("wool_white","#f0f0ec","#e4e4e0","#ffffff"),Kr("wool_red","#c03040","#b02838","#d04050"),Kr("wool_blue","#3050c0","#2844a8","#4060d0"),Kr("wool_yellow","#e0c030","#d0b028","#f0d040"),{name:"ferro_lantern",draw:ob},{name:"campfire_top",draw:ab},{name:"campfire_side",draw:lb},{name:"glowshroom",draw:qM},UM("crystal_block"),OM("aurum_block"),th("ferrite_block","#9aa3ad","#c0c8d0","#7a838d"),th("copper_block","#b06a3a","#c88450","#905830","#6a9a80"),Ge("coal_block","#2a2a2c",["#3a3a40","#1e1e22","#333338"],.5),{name:"sapling_sable",draw:Ha("#6e4f2e","#4a9a3a","#3a7e2c",!1)},{name:"sapling_pine",draw:Ha("#4e3824","#2a6a4a","#1e5538",!0)},{name:"sapling_dune",draw:Ha("#a88848","#7a9a3a","#6a8a2e",!1)},{name:"dewberry_full",draw:rh(!0)},{name:"dewberry_empty",draw:rh(!1)}],Hd=cb(kl);function ub(i){for(let t=0;t<kl.length;t++){const e=t%We*K,n=(We-1-Math.floor(t/We))*K;i.clearRect(e,n,K,K),kl[t].draw(i,e,n)}}function hb(){const i=document.createElement("canvas");i.width=We*K,i.height=We*K;const t=i.getContext("2d");if(!t)throw new Error("Unable to acquire 2D context for atlas canvas");return t.imageSmoothingEnabled=!1,ub(t),i}function dc(i,t){const e=ce(i);if(!e)return 0;const n=e.tiles;let s;if(e.render==="cross"?s=n.all:t===nr?s=n.top??n.all??n.side??n.front:t===oc?s=n.bottom??n.all??n.side??n.front:t===ac?s=n.front??n.side??n.all:s=n.side??n.all??n.front,s===void 0)return 0;const r=Hd[s];return r===void 0?0:r}function Gd(){const i=new ic(hb());return i.magFilter=we,i.minFilter=we,i.generateMipmaps=!1,i.wrapS=Fn,i.wrapT=Fn,i.needsUpdate=!0,i}const Ga=`
attribute float sky;
attribute float block;
attribute float ao;
varying float vSky;
varying float vBlock;
varying float vAo;
varying float vShade;
varying vec2 vUv;
varying vec3 vWorldPosition;
void main() {
  vec3 n = normalize(mat3(modelMatrix) * normal);
  vSky = sky;
  vBlock = block;
  vAo = ao;
  vShade = n.y > 0.5 ? 1.0 : n.y < -0.5 ? 0.5 : abs(n.z) > 0.5 ? 0.8 : 0.6;
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`,Va=`
uniform sampler2D uAtlas;
uniform float uDay;
uniform float uMinLight;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uFogStartFactor;
uniform float uFogDistance;
uniform vec3 uCameraPosition;
uniform float uWaterAlpha;
uniform float uAlphaTest;
varying float vSky;
varying float vBlock;
varying float vAo;
varying float vShade;
varying vec2 vUv;
varying vec3 vWorldPosition;
void main() {
  vec4 tex = texture2D(uAtlas, vUv);
  if (tex.a < uAlphaTest) discard;
  float light = max(max(uDay * vSky, vBlock), uMinLight);
  vec3 litColor = tex.rgb * light * vShade * vAo;
  float fogStart = uFogDistance * uFogStartFactor;
  float fogRange = max(uFogDistance - fogStart, 0.0001);
  float fogProgress = clamp((distance(vWorldPosition, uCameraPosition) - fogStart) / fogRange, 0.0, 1.0);
  float fogAmount = 1.0 - exp(-3.0 * uFogDensity * fogProgress);
  float alpha = tex.a * uWaterAlpha;
  gl_FragColor = vec4(mix(litColor, uFogColor, fogAmount), alpha);
}
`;function Vd(i,t="medium"){const e={uAtlas:{value:i},uDay:{value:1},uMinLight:{value:.12},uFogColor:{value:new Zt(.62,.76,.9)},uFogDensity:{value:Li[t].fogDensity},uFogStartFactor:{value:Ef},uFogDistance:{value:Ih*16},uCameraPosition:{value:new k}},n=(s,r)=>({...e,uWaterAlpha:{value:s},uAlphaTest:{value:r}});return{terrain:new Sn({vertexShader:Ga,fragmentShader:Va,uniforms:n(1,0)}),water:new Sn({vertexShader:Ga,fragmentShader:Va,uniforms:n(.75,0),transparent:!0,depthWrite:!1}),plants:new Sn({vertexShader:Ga,fragmentShader:Va,uniforms:n(1,.5),side:_n,alphaTest:.5})}}function db(i){const t=new Mn;return t.setAttribute("position",new Ae(i.positions,3)),t.setAttribute("normal",new Ae(i.normals,3)),t.setAttribute("uv",new Ae(i.uvs,2)),t.setAttribute("sky",new Ae(i.sky,1)),t.setAttribute("block",new Ae(i.block,1)),t.setAttribute("ao",new Ae(i.ao,1)),t.setIndex(new Ae(i.indices,1)),t}class fb{constructor(t,e,n={}){this.scene=t,this.world=e;const s=n.atlas??Gd();this.materials=n.materials??Vd(s),this.clock=n.clock??(()=>performance.now())}chunks=new Map;dirty=new Map;materials;clock;centerX=0;centerZ=0;sequence=0;update(t,e){this.centerX=t,this.centerZ=e;for(const n of this.world.chunks.values())(n.meshDirty||!this.chunks.has(this.key(n.cx,n.cz)))&&this.markDirty(n.cx,n.cz);this.sortDirty()}markDirty(t,e){const n=this.key(t,e);this.dirty.has(n)||this.dirty.set(n,{cx:t,cz:e,sequence:this.sequence++})}rebuildBudgeted(t){const e=this.clock();let n=0;for(;this.dirty.size>0;){const[s,r]=this.nextDirty();this.dirty.delete(s);const o=this.world.getChunkIfLoaded(r.cx,r.cz);if(o?(this.rebuild(o),n++):this.dispose(r.cx,r.cz),this.clock()-e>t)break}return n}dispose(t,e){const n=this.key(t,e);this.dirty.delete(n);const s=this.chunks.get(n);if(s){for(const r of s.meshes)this.scene.remove(r),r.geometry.dispose();this.chunks.delete(n)}}rebuild(t){const e=this.key(t.cx,t.cz),n=Sx(this.world,t,dc),s=[{arrays:n.opaque,material:this.materials.terrain},{arrays:n.water,material:this.materials.water},{arrays:n.plants,material:this.materials.plants}],r=[];for(const o of s){if(o.arrays.indices.length===0)continue;const a=new Ke(db(o.arrays),o.material);a.position.set(t.cx*it,0,t.cz*mt),a.userData.chunkX=t.cx,a.userData.chunkZ=t.cz,r.push(a)}this.disposeRendered(e);for(const o of r)this.scene.add(o);this.chunks.set(e,{meshes:r}),t.meshDirty=!1}disposeRendered(t){const e=this.chunks.get(t);if(e)for(const n of e.meshes)this.scene.remove(n),n.geometry.dispose()}nextDirty(){this.sortDirty();const t=this.dirty.entries().next();if(t.done)throw new Error("Dirty chunk queue unexpectedly empty");return t.value}sortDirty(){const t=[...this.dirty.entries()].sort(([,e],[,n])=>this.distance(e)-this.distance(n)||e.sequence-n.sequence);this.dirty.clear();for(const[e,n]of t)this.dirty.set(e,n)}distance(t){const e=Math.abs(t.cx-this.centerX),n=Math.abs(t.cz-this.centerZ);return Math.max(e,n)+Math.min(e,n)/2}key(t,e){return`${t},${e}`}}const pb=.32,mb=.08;class gb{constructor(t,e){this.scene=t,this.icons=e}sprites=new Map;materials=new Map;sync(t,e){const n=new Set(t);for(const[s,r]of this.sprites)n.has(s)||(this.scene.remove(r),this.sprites.delete(s));for(const s of t){let r=this.sprites.get(s);r||(r=new Jv(this.material(s.item)),r.scale.setScalar(pb),this.scene.add(r),this.sprites.set(s,r));const o=Math.sin(e*3+s.x*1.7+s.z)*mb;r.position.set(s.x,s.y+.05+o,s.z)}}dispose(){for(const t of this.sprites.values())this.scene.remove(t);this.sprites.clear();for(const t of this.materials.values())t.map?.dispose(),t.dispose();this.materials.clear()}material(t){const e=this.materials.get(t);if(e)return e;const n=new ic(this.icons.canvasFor(t));n.magFilter=we,n.minFilter=we,n.colorSpace=on;const s=new fd({map:n,transparent:!0,alphaTest:.1});return this.materials.set(t,s),s}}const _b=new Zt(1,.25,.2),vb=new li(1,1,1);function Xe(i,t,e,n,s,r,o,a,l,c){const u=new lr({color:t});l.push(u),c.push(new Zt(t));const h=new Ke(vb,u);return h.scale.set(e,n,s),h.position.set(r,o,a),i.add(h),h}function Ws(i,t,e,n,s,r,o,a,l){const c=new ze;return c.position.set(s,o,r),i.add(c),Xe(c,t,e,n,e,0,-n/2,0,a,l),c}function xb(i){const t=new Ks,e=[],n=[],s=[],{w:r,h:o}=i.size,a=i.colors;switch(i.model){case"quadruped":{const l=o*.38;Xe(t,a.body,r*.8,o*.42,r*1.25,0,l+o*.21,0,e,n),Xe(t,a.head,r*.55,o*.4,r*.5,0,l+o*.42,r*.78,e,n),Xe(t,a.accent,r*.3,o*.12,r*.12,0,l+o*.33,r*1.06,e,n);for(const[c,u]of[[-1,-1],[1,-1],[-1,1],[1,1]])s.push(Ws(t,a.legs,r*.22,l,c*r*.26,u*r*.42,l,e,n));break}case"bird":{const l=o*.25;Xe(t,a.body,r*.7,o*.45,r*.9,0,l+o*.22,0,e,n),Xe(t,a.head,r*.45,o*.35,r*.45,0,l+o*.55,r*.35,e,n),Xe(t,a.accent,r*.18,o*.1,r*.25,0,l+o*.5,r*.65,e,n);for(const c of[-1,1])s.push(Ws(t,a.legs,r*.1,l,c*r*.16,0,l,e,n));break}case"wisp":{Xe(t,a.body,r*.8,o*.6,r*.8,0,o*.5,0,e,n),Xe(t,a.head,r*.45,o*.3,r*.45,0,o*.95,0,e,n),Xe(t,a.accent,r*.3,o*.25,r*.3,0,o*.12,0,e,n);break}case"crawler":{Xe(t,a.body,r,o*.5,r*1.2,0,o*.45,0,e,n),Xe(t,a.head,r*.6,o*.45,r*.45,0,o*.5,r*.75,e,n);for(const l of[-1,1])for(const c of[-1,0,1])s.push(Ws(t,a.legs,r*.12,o*.35,l*r*.55,c*r*.4,o*.35,e,n));break}default:{const l=o*.45;Xe(t,a.body,r*.75,o*.35,r*.4,0,l+o*.18,0,e,n),Xe(t,a.head,r*.6,o*.22,r*.55,0,l+o*.46,0,e,n);for(const c of[-1,1])s.push(Ws(t,a.legs,r*.22,l,c*r*.2,0,l,e,n)),s.push(Ws(t,a.accent,r*.16,o*.32,c*r*.48,0,l+o*.34,e,n))}}return{group:t,legs:s,materials:e,colors:n}}class Sb{constructor(t,e){this.scene=t,this.lights=e}models=new Map;sync(t,e,n,s,r){const o=new Set(t);for(const[a,l]of this.models)if(!o.has(a)){this.scene.remove(l.group);for(const c of l.materials)c.dispose();this.models.delete(a)}for(const a of t){let l=this.models.get(a);l||(l=xb(a.def),this.models.set(a,l),this.scene.add(l.group));const c=a.x-e.x,u=a.z-e.z;if(l.group.visible=c*c+u*u<=n*n,!l.group.visible)continue;const h=a.def.model==="wisp"?Math.sin(r*2.5+a.id)*.08:0;l.group.position.set(a.x,a.y+h,a.z),l.group.rotation.y=a.yaw;const d=Math.sin(a.walkPhase)*.6;l.legs.forEach((M,A)=>{M.rotation.x=A%2===0?d:-d});const f=Math.floor(a.x),g=Math.floor(a.y+a.def.size.h*.5),_=Math.floor(a.z),m=.25+.75*Math.max(this.lights.getSkyLight(f,g,_)/15*s,this.lights.getBlockLight(f,g,_)/15),y=a.hurtTime>0;l.materials.forEach((M,A)=>{M.color.copy(l.colors[A]).multiplyScalar(m),y&&M.color.lerp(_b,.55)})}}dispose(){for(const t of this.models.values()){this.scene.remove(t.group);for(const e of t.materials)e.dispose()}this.models.clear()}}const Mb=84,xi=128,oh=6,bb=.6;function yb(i,t){const e=new Uint8Array(i*i),n=(s,r,o)=>{const a=Math.floor(s/o),l=Math.floor(r/o),c=s/o-a,u=r/o-l,h=i/o,d=(m,y)=>Js((m%h+h)%h,(y%h+h)%h,t)/4294967296,f=c*c*(3-2*c),g=u*u*(3-2*u),_=d(a,l)+(d(a+1,l)-d(a,l))*f,p=d(a,l+1)+(d(a+1,l+1)-d(a,l+1))*f;return _+(p-_)*g};for(let s=0;s<i;s++)for(let r=0;r<i;r++){const o=n(r,s,16)*.6+n(r,s,8)*.3+n(r,s,4)*.1;e[s*i+r]=o>.56?1:0}return e}class Eb{mesh;texture;material;span;constructor(t,e,n){const s=document.createElement("canvas");s.width=xi,s.height=xi;const r=s.getContext("2d"),o=yb(xi,e);if(r){const l=r.createImageData(xi,xi);for(let c=0;c<o.length;c++)l.data[c*4]=255,l.data[c*4+1]=255,l.data[c*4+2]=255,l.data[c*4+3]=o[c]?215:0;r.putImageData(l,0,0)}this.texture=new ic(s),this.texture.magFilter=we,this.texture.minFilter=we,this.texture.wrapS=tr,this.texture.wrapT=tr,this.span=Math.max(256,n*3);const a=this.span/(xi*oh);this.texture.repeat.set(a,a),this.material=new lr({map:this.texture,transparent:!0,depthWrite:!1,side:_n,fog:!1}),this.mesh=new Ke(new cr(this.span,this.span),this.material),this.mesh.rotation.x=-Math.PI/2,this.mesh.renderOrder=2,t.add(this.mesh)}update(t,e,n,s){this.mesh.position.set(t,Mb,e);const r=xi*oh,o=n*bb;this.texture.offset.set((t+o)/r,-e/r),this.material.color.setScalar(Math.max(.25,s))}setVisible(t){this.mesh.visible=t}dispose(t){t.remove(this.mesh),this.mesh.geometry.dispose(),this.material.dispose(),this.texture.dispose()}}const wb=[[3,3],[12,4],[7,8],[4,12],[11,11],[8,2]];class Ab{cache=new Map;ctx;constructor(t){this.ctx=t.getContext("2d",{willReadFrequently:!0})}colorsFor(t){const e=this.cache.get(t);if(e)return e;const n=ce(t),r=(n.particleTile?Hd[n.particleTile]:void 0)??dc(t,zo),o=r%We*wn,a=(We-1-Math.floor(r/We))*wn,l=[];if(this.ctx){const c=this.ctx.getImageData(o,a,wn,wn).data;for(const[u,h]of wb){const d=(h*wn+u)*4;c[d+3]<128||l.push(c[d]<<16|c[d+1]<<8|c[d+2])}}return l.length===0&&l.push(8947848),this.cache.set(t,l),l}}class Tb{constructor(t,e){this.scene=t,this.capacity=e;const n=new lr({color:16777215});this.mesh=new ex(new li(1,1,1),n,Math.max(1,e)),this.mesh.instanceMatrix.setUsage(Op),this.mesh.frustumCulled=!1,this.mesh.count=0,t.add(this.mesh)}mesh;matrix=new fe;color=new Zt;quaternion=new Es;position=new k;scale=new k;sync(t,e){const n=Math.min(t.length,this.capacity);for(let s=0;s<n;s++){const r=t[s],o=Math.min(1,r.life/(r.maxLife*.4));this.position.set(r.x,r.y,r.z),this.scale.setScalar(r.size*o),this.matrix.compose(this.position,this.quaternion,this.scale),this.mesh.setMatrixAt(s,this.matrix),this.mesh.setColorAt(s,this.color.setHex(r.color).multiplyScalar(e))}this.mesh.count=n,this.mesh.instanceMatrix.needsUpdate=!0,this.mesh.instanceColor&&(this.mesh.instanceColor.needsUpdate=!0)}dispose(){this.scene.remove(this.mesh),this.mesh.geometry.dispose(),this.mesh.material.dispose(),this.mesh.dispose()}}const Rb=8,Cb=12,Lb=.45,Pb=.9,Ib=.9;class Db{constructor(t){this.cap=t}particles=[];burst(t,e,n,s,r,o){if(s.length===0||this.cap<=0)return 0;const a=o??r.intRange(Rb,Cb);let l=0;for(let c=0;c<a;c++){this.particles.length>=this.cap&&this.particles.shift();const u=r.range(Lb,Pb);this.particles.push({x:t+r.range(-.35,.35),y:e+r.range(-.35,.35),z:n+r.range(-.35,.35),vx:r.range(-2,2),vy:r.range(1.5,4.5),vz:r.range(-2,2),life:u,maxLife:u,color:s[r.nextInt(s.length)],size:r.range(.07,.13)}),l++}return l}step(t,e=null){const n=Math.pow(Ib,t*20);for(let s=this.particles.length-1;s>=0;s--){const r=this.particles[s];if(r.life-=t,r.life<=0){this.particles.splice(s,1);continue}r.vy+=ps*.6*t,r.vx*=n,r.vz*=n;const o=r.y+r.vy*t;e&&r.vy<0&&Fe(e.getBlock(Math.floor(r.x),Math.floor(o-r.size/2),Math.floor(r.z)))?(r.y=Math.floor(o-r.size/2)+1+r.size/2,r.vy=0,r.vx*=.5,r.vz*=.5):r.y=o,r.x+=r.vx*t,r.z+=r.vz*t}}setCap(t){this.cap=Math.max(0,Math.floor(t)),this.particles.length>this.cap&&this.particles.splice(0,this.particles.length-this.cap)}clear(){this.particles.length=0}}const fs=.08,Nb={top:[.03,.04,.1],horizon:[.07,.08,.16],fog:[.05,.06,.12],sunIntensity:.05},ah={top:[.32,.28,.44],horizon:[.86,.54,.32],fog:[.52,.42,.46],sunIntensity:.35},Ub={top:[.36,.58,.88],horizon:[.74,.86,.96],fog:[.62,.76,.92],sunIntensity:1};function lo(i,t,e){return i+(t-i)*e}function Wa(i,t,e){return[lo(i[0],t[0],e),lo(i[1],t[1],e),lo(i[2],t[2],e)]}function lh(i,t,e){return{top:Wa(i.top,t.top,e),horizon:Wa(i.horizon,t.horizon,e),fog:Wa(i.fog,t.fog,e),sunIntensity:lo(i.sunIntensity,t.sunIntensity,e)}}function Ob(i){const t=Math.min(1,Math.max(fs,i));return t<=.5?lh(Nb,ah,(t-fs)/(.5-fs)):lh(ah,Ub,(t-.5)/.5)}const ch=[[1,0],[-1,0],[0,1],[0,-1]];function uh(i){const t=[[0,0]];for(let e=1;e<=i;e++){for(let n=-e;n<=e;n++)t.push([n,-e]);for(let n=-e+1;n<=e;n++)t.push([e,n]);for(let n=e-1;n>=-e;n--)t.push([n,e]);for(let n=e-1;n>-e;n--)t.push([-e,n])}return t}function Zr(i,t){return Math.floor(i/t)}class hh{constructor(t,e,n={}){this.world=t,this.renderer=e,this.renderDistance=Math.max(0,Math.floor(n.renderDistance??Ih)),this.unloadMargin=Math.max(0,Math.floor(n.unloadMargin??Lf)),this.loadsPerUpdate=Math.max(1,Math.floor(n.loadsPerUpdate??2)),this.offsets=uh(this.renderDistance)}renderDistance;unloadMargin;loadsPerUpdate;offsets;counters={centerCx:0,centerCz:0,loaded:0,pending:0,loadedLastUpdate:0,unloadedLastUpdate:0,loadedTotal:0,unloadedTotal:0};get stats(){return this.counters}update(t,e){const n=Zr(t,it),s=Zr(e,mt);return this.counters.centerCx=n,this.counters.centerCz=s,this.counters.unloadedLastUpdate=this.unloadFar(n,s),this.counters.loadedLastUpdate=this.loadNear(n,s),this.counters.loaded=this.countLoaded(),this.counters.pending=this.countPending(n,s),this.counters}loadAllNow(t,e,n=this.renderDistance){const s=Zr(t,it),r=Zr(e,mt),o=n===this.renderDistance?this.offsets:uh(Math.min(n,this.renderDistance));let a=0;for(const[l,c]of o)this.load(s+l,r+c)&&a++;return this.counters.loaded=this.countLoaded(),this.counters.pending=this.countPending(s,r),a}loadNear(t,e){let n=0;for(const[s,r]of this.offsets){if(n>=this.loadsPerUpdate)break;this.load(t+s,e+r)&&n++}return n}load(t,e){if(this.world.isChunkLoaded(t,e))return!1;this.world.ensureChunk(t,e),this.renderer.markDirty(t,e);for(const[n,s]of ch)this.world.isChunkLoaded(t+n,e+s)&&this.renderer.markDirty(t+n,e+s);return this.counters.loadedTotal++,!0}unloadFar(t,e){const n=this.renderDistance+this.unloadMargin,s=[];for(const r of this.world.chunks.values())Math.max(Math.abs(r.cx-t),Math.abs(r.cz-e))>n&&s.push([r.cx,r.cz]);for(const[r,o]of s){this.world.unloadChunk(r,o),this.renderer.dispose(r,o);for(const[a,l]of ch)this.world.isChunkLoaded(r+a,o+l)&&this.renderer.markDirty(r+a,o+l)}return this.counters.unloadedTotal+=s.length,s.length}countLoaded(){return this.world.chunks.size}countPending(t,e){let n=0;for(const[s,r]of this.offsets)this.world.isChunkLoaded(t+s,e+r)||n++;return n}}const kb=70,Fb=.1,Bb=4,zb=1,Hb=.25,Gb=6,Vb=.45,Wb=.6,Xb=.05,Yb=1,dh=7,qb=1.7,$b=.24,Kb=400;class jb{world;renderer;scene;camera;materials;chunkRenderer;player;streamer;playerPosition=new k;mode;inventory=new To;equipment=new Ao;mining=new JS;drops=new MS;projectiles=new $S;chunkEncoder=new gM;containers=new wo;entities;stats=new Ro;entityRenderer;attackCooldown=0;bowCooldown=0;trailTimer=0;particles=new Db(0);particleRenderer=null;blockColors=null;clouds=null;stepDistance=0;digSoundTimer=0;quality;respawnPoint=null;events={};target=null;dropRenderer=null;rng;selection;atlas;background=new Zt;clock;lastFrame;constructor(t,e,n={}){const s=n.quality??"medium";this.quality=s;const r=Li[s],o=n.renderDistance??r.renderDistance,a=e.findSpawn();this.world=e,this.clock=n.clock??(()=>performance.now()),this.lastFrame=this.clock(),this.mode=n.mode??"survival",this.rng=new Ci(e.seedInt^24301),this.player=new eM(e,a,{canFly:this.mode==="creative"}),this.entities=new tS(new Ci(e.seedInt^12648430)),this.renderer=new Kv({canvas:t,antialias:!0,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,r.pixelRatioCap)),this.renderer.setSize(window.innerWidth,window.innerHeight,!1),this.renderer.outputColorSpace=on,this.scene=new jv,this.scene.background=this.background,this.camera=new an(kb,window.innerWidth/window.innerHeight,Fb,(o+2)*16),this.camera.rotation.order="YXZ",this.selection=new ix(new sx(new li(1.004,1.004,1.004)),new md({color:1053720,transparent:!0,opacity:.7})),this.selection.visible=!1,this.scene.add(this.selection),this.entityRenderer=new Sb(this.scene,e),this.particles.setCap(r.particles),this.particleRenderer=new Tb(this.scene,Kb),this.clouds=new Eb(this.scene,e.seedInt,o*16),this.clouds.setVisible(r.clouds),this.atlas=Gd(),this.materials=Vd(this.atlas,s);for(const l of[this.materials.terrain,this.materials.water,this.materials.plants])l.uniforms.uFogDistance.value=o*16;this.chunkRenderer=new fb(this.scene,e,{atlas:this.atlas,materials:this.materials}),this.streamer=new hh(e,this.chunkRenderer,{renderDistance:o}),this.streamer.loadAllNow(a.x,a.z,zb),this.syncCamera(),this.chunkRenderer.update(this.chunkX,this.chunkZ),this.applySky()}get streamStats(){return this.streamer.stats}get atlasCanvas(){return this.atlas.image}attachIcons(t){this.blockColors=new Ab(this.atlasCanvas),this.dropRenderer?.dispose(),this.dropRenderer=new gb(this.scene,t)}snapshot(){const{position:t,yaw:e,pitch:n}=this.player.state;return{seed:this.world.seedInt,mode:this.mode,time:this.world.time,player:{x:t.x,y:t.y,z:t.z,yaw:e,pitch:n,respawn:this.respawnPoint},stats:this.stats.toJSON(),inventory:this.inventory.toJSON(),armor:this.equipment.toJSON(),containers:this.containers.toJSON(),entities:this.entities.toJSON(),chunks:this.world.modifiedChunkData()}}saveFile(){const t=this.snapshot(),e=_M(t,(n,s)=>this.chunkEncoder.encode(n,this.world.chunkRevision(n),s));return this.chunkEncoder.retain(t.chunks.keys()),e}restore(t){this.world.time=t.time,this.inventory=To.fromJSON(t.inventory),this.equipment=Ao.fromJSON(t.armor),this.stats=Ro.fromJSON(t.stats),this.containers=wo.fromJSON(t.containers),this.entities.load(t.entities),this.respawnPoint=t.player.respawn,this.drops.clear(),this.projectiles.clear(),this.mining.reset(),this.player.spawnAt(t.player),this.player.state.yaw=t.player.yaw,this.player.state.pitch=t.player.pitch,this.streamer.loadAllNow(t.player.x,t.player.z,1),this.syncCamera()}setRenderDistance(t){if(t!==this.streamer.renderDistance){this.streamer=new hh(this.world,this.chunkRenderer,{renderDistance:t}),this.camera.far=(t+2)*16,this.camera.updateProjectionMatrix();for(const e of[this.materials.terrain,this.materials.water,this.materials.plants])e.uniforms.uFogDistance.value=t*16}}setPixelRatioCap(t){this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,t)),this.renderer.setSize(window.innerWidth,window.innerHeight,!1)}get creative(){return this.mode==="creative"}update(t){const e=this.clock(),n=Math.min(Math.max((e-this.lastFrame)/1e3,0),Hb);this.lastFrame=e,this.inventory.selectedIndex=t.hotbarSlot,t.active&&this.playerAlive&&(this.player.look(t.dyaw,t.dpitch),this.player.move(t.move,n));const{x:s,y:r,z:o}=this.player.state.position;this.streamer.update(s,o),this.syncCamera(),this.updateTarget(),t.active&&this.playerAlive?(this.tickStats(n,t.move),this.tickEntities(n),this.playerAlive&&this.interact(t,n)):this.mining.reset(),t.active&&(this.drops.tick(this.world,n,{x:s,y:r,z:o},a=>{const l=this.inventory.add(a);return(!l||l.count<a.count)&&this.sound("pickup","plant"),l}),this.tickProjectiles(n)),this.particles.step(n,this.world),t.active&&this.footsteps(n)}tickProjectiles(t){if(this.projectiles.count===0)return;if(this.trailTimer+=t,this.trailTimer>=Xb){this.trailTimer=0;for(const n of this.projectiles.list)this.trailParticle(n.x,n.y,n.z)}const e=this.projectiles.tick(this.world,t,(n,s,r)=>{const o=this.entities.raycast(n,s,r);return o?(this.entities.damage(o.entity,n.damage,n.x,n.z),this.sound("hurt","wool"),!0):!1});for(const n of e)n.blocked&&this.particles.burst(n.x,n.y,n.z,[15262415],this.rng,3)}trailParticle(t,e,n){const s=this.particles;s.cap<=0||s.particles.length>=s.cap||s.particles.push({x:t,y:e,z:n,vx:0,vy:0,vz:0,life:.16,maxLife:.16,color:15262415,size:.06})}sound(t,e){this.events.onSound?.(t,e)}materialOf(t){return ce(t).material}footsteps(t){const e=this.player.state;if(!e.onGround||e.flying){this.stepDistance=0;return}if(this.stepDistance+=Math.hypot(e.velocity.x,e.velocity.z)*t,this.stepDistance<qb)return;this.stepDistance=0;const{x:n,y:s,z:r}=e.position,o=this.world.getBlock(Math.floor(n),Math.floor(s)-1,Math.floor(r));o!==T.AIR&&this.sound("step",this.materialOf(o))}setQuality(t){this.quality=t;const e=Li[t];this.particles.setCap(e.particles),this.clouds?.setVisible(e.clouds)}updateTarget(){const t=this.player.eyePosition(),e=this.player.lookDirection(),n=this.creative?Ec:yc;this.target=Cd(this.world,t.x,t.y,t.z,e.x,e.y,e.z,n),this.selection.visible=this.target!==null,this.target&&this.selection.position.set(this.target.x+.5,this.target.y+.5,this.target.z+.5)}tickEntities(t){const{x:e,y:n,z:s}=this.player.state.position;this.entities.tick(this.world,{x:e,y:n,z:s,alive:this.playerAlive&&!this.creative,eyeHeight:this.player.eyePosition().y-n},t,{damagePlayer:(r,o,a,l)=>{const c=this.player.state.velocity;c.x+=a*dh,c.z+=l*dh,c.y=Math.max(c.y,4),this.hurtPlayer(r,"mob",o)},dropLoot:(r,o,a,l)=>this.drops.spawn(r,o,a,l)})}get playerAlive(){return!this.stats.dead}hurtPlayer(t,e,n=null){if(this.creative||this.stats.dead)return;this.syncArmor();const s=this.stats.damage(t,e);s.amount<=0||((s.absorbed??0)>0&&this.equipment.wear(),this.events.onPlayerDamaged?.(s.amount,e,n),this.sound("hurt","wool"),s.died&&this.die())}die(){const{x:t,y:e,z:n}=this.player.state.position,s=dM(this.inventory);for(const r of this.equipment.slots)r&&s.push(r);this.equipment.clear();for(const r of s)this.drops.spawn(r,t+this.rng.range(-.6,.6),e+1,n+this.rng.range(-.6,.6),this.rng.range(2,5),1.5);this.mining.reset(),this.events.onDeath?.(this.stats.lastDamage)}respawn(){const t=this.respawnPoint??this.world.findSpawn();this.player.spawnAt(t),this.stats.respawn(),this.streamer.loadAllNow(t.x,t.z,1),this.syncCamera()}syncArmor(){this.stats.armorPoints=this.equipment.points,this.stats.armorToughness=this.equipment.toughness}tickStats(t,e){if(this.creative||this.stats.dead)return;this.syncArmor();const n=this.player.state,s=this.player.eyePosition(),r=this.stats.tick(t,{y:n.position.y,onGround:n.onGround,inWater:n.inWater,headInWater:or(this.world.getBlock(Math.floor(s.x),Math.floor(s.y),Math.floor(s.z))),flying:n.flying,moving:e.forward!==0||e.strafe!==0,sprinting:n.sprinting});for(const o of r)(o.absorbed??0)>0&&this.equipment.wear(),this.events.onPlayerDamaged?.(o.amount,o.source,null),this.sound("hurt","wool"),o.died&&this.die()}hitEntity(){const t=this.player.eyePosition(),e=this.player.lookDirection(),n=this.creative?Ec:yc,s=this.target?this.target.distance:n,r=this.entities.raycast(t,e,Math.min(n,s+.01));if(!r)return!1;if(this.attackCooldown>0)return!0;this.attackCooldown=Vb;const o=this.inventory.selected,a=o?ci(o.item):void 0,{x:l,z:c}=this.player.state.position;return this.entities.damage(r.entity,a?a.damage:Yb,l,c),a&&!this.creative&&this.inventory.damage(this.inventory.selectedIndex,1),!0}interact(t,e){const n=this.inventory.selected?.item??null;if(this.attackCooldown=Math.max(0,this.attackCooldown-e),this.bowCooldown=Math.max(0,this.bowCooldown-e),t.attack&&this.hitEntity())this.mining.reset();else if(t.attack){const s=this.mining.tick(this.world,this.target,n,e,this.creative);s&&this.onMiningEvent(s),this.digSoundTimer-=e,!s&&this.target&&this.mining.progress>0&&this.digSoundTimer<=0&&(this.digSoundTimer=$b,this.sound("dig",this.materialOf(this.target.id)))}else this.mining.reset();if(t.uses>0&&Ri(n??"")?.useAction==="bow")this.fireArrow();else for(let s=0;s<t.uses&&this.target;s++)this.use(this.target,t.move.sneak)}fireArrow(){if(this.bowCooldown>0)return;const t=Ri("bow")?.projectile;if(!t||!this.creative&&!this.inventory.consume("arrow",1))return;this.bowCooldown=Wb;const e=this.player.eyePosition(),n=this.player.lookDirection();this.projectiles.shoot({x:e.x+n.x*.4,y:e.y+n.y*.4,z:e.z+n.z*.4},n,t.speed,t.damage),this.sound("place","wood")}fumeBurst(t){this.particles.burst(t.x+.5,t.y+1.05,t.z+.5,[12174025],this.rng,10),this.sound("dig","stone")}seedCampChest(t){if(!this.world.isCampChest(t.x,t.y,t.z)||this.containers.get(t.x,t.y,t.z))return;const e=this.containers.open("chest",t.x,t.y,t.z);if(e.kind!=="chest")return;let n=0;for(const s of WS(this.rng)){if(n>=e.slots.length)break;e.slots[n++]=s}}onMiningEvent(t){if(this.events.onMining?.(t),t.kind==="broken"){this.sound("break",this.materialOf(t.id)),this.blockColors&&this.particles.burst(t.x+.5,t.y+.5,t.z+.5,this.blockColors.colorsFor(t.id),this.rng),t.harvest&&this.dropBlock(t.id,t);for(const e of this.containers.remove(t.x,t.y,t.z))this.drops.spawn(e,t.x+.5,t.y+.5,t.z+.5);for(const e of zS(this.world,t.x,t.y,t.z))this.creative||this.dropBlock(e.id,e);t.wear>0&&this.inventory.damage(this.inventory.selectedIndex,t.wear)}}dropBlock(t,e){for(const n of SS(t,this.rng))this.drops.spawn(n,e.x+.5,e.y+.5,e.z+.5)}use(t,e){if(!e){this.seedCampChest(t);const a=BS(this.world,this.containers,t);if(a){a.kind==="bed"&&(this.respawnPoint=a.spawn),a.kind==="fume"&&this.fumeBurst(a.at),this.events.onInteract?.(a);return}}const n=this.inventory.selectedIndex,s=this.inventory.selected;if(!s)return;if(So(s.item)){!this.creative&&this.stats.eat(s.item)&&(this.inventory.removeAt(n,1),this.sound("eat","plant"));return}if(Ri(s.item)?.useAction==="bone_meal"){LS(this.world,t.x,t.y,t.z,this.rng)&&!this.creative&&this.inventory.removeAt(n,1);return}const r=FS(this.world,t,s.item);if(r.ok){r.wear>0&&!this.creative&&this.inventory.damage(n,r.wear),r.consume&&!this.creative&&this.inventory.removeAt(n,1),r.give&&this.giveOrDrop(r.give);return}const o=kS(this.world,t,s.item,this.player.state.position);if(!o.ok){this.events.onPlaceFailed?.(o.reason);return}this.sound("place",this.materialOf(o.blockId)),this.creative||(this.inventory.removeAt(n,1),o.give&&this.giveOrDrop(o.give))}giveOrDrop(t){const e=this.inventory.add(t);if(!e)return;const{x:n,y:s,z:r}=this.player.state.position;this.drops.spawn(e,n,s+1,r)}tick(){this.world.advanceTime(1);const t=Rh/1e3;for(const[e,n,s,r]of this.containers.furnaces()){const o=fS(r,t);if(!o.changed)continue;const a=this.world.getBlock(e,n,s);(a===T.FURNACE||a===T.FURNACE_LIT)&&this.world.setBlock(e,n,s,o.lit?T.FURNACE_LIT:T.FURNACE)}for(const e of this.world.chunks.values())for(let n=0;n<Gb;n++){const s=e.cx*it+this.rng.nextInt(it),r=e.cz*mt+this.rng.nextInt(mt),o=1+this.rng.nextInt(qt-2);PS(this.world,s,o,r,this.rng)}}render(){this.applySky(),this.chunkRenderer.update(this.chunkX,this.chunkZ),this.chunkRenderer.rebuildBudgeted(Bb),this.dropRenderer?.sync(this.drops.drops,this.clock()/1e3),this.entityRenderer.sync(this.entities.entities,this.camera.position,this.camera.far,Math.max(this.world.dayFactor,fs),this.clock()/1e3);const t=Math.max(this.world.dayFactor,fs);this.particleRenderer?.sync(this.particles.particles,.35+.65*t),this.clouds?.update(this.camera.position.x,this.camera.position.z,this.clock()/1e3,t),this.renderer.render(this.scene,this.camera)}resize(t,e){this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),this.renderer.setSize(t,e,!1)}dispose(){this.dropRenderer?.dispose(),this.particleRenderer?.dispose(),this.clouds?.dispose(this.scene),this.entityRenderer.dispose();for(const t of this.world.chunks.values())this.chunkRenderer.dispose(t.cx,t.cz);this.materials.terrain.dispose(),this.materials.water.dispose(),this.materials.plants.dispose(),this.atlas.dispose(),this.renderer.dispose()}get chunkX(){return Math.floor(this.player.state.position.x/it)}get chunkZ(){return Math.floor(this.player.state.position.z/mt)}syncCamera(){const{position:t,yaw:e,pitch:n}=this.player.state,s=this.player.eyePosition();this.playerPosition.set(t.x,t.y,t.z),this.camera.position.set(s.x,s.y,s.z),this.camera.rotation.set(n,e,0)}applySky(){const t=Math.max(this.world.dayFactor,fs),e=Ob(t);this.background.setRGB(e.horizon[0],e.horizon[1],e.horizon[2]);for(const n of[this.materials.terrain,this.materials.water,this.materials.plants])n.uniforms.uDay.value=t,n.uniforms.uFogColor.value.setRGB(e.fog[0],e.fog[1],e.fog[2]),n.uniforms.uCameraPosition.value.copy(this.camera.position)}}const Zb=300,Jb=.0025,Qb=new Set(["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space","ShiftLeft","ShiftRight","ControlLeft","ControlRight"]);function ty(){return{held:new Set,locked:!1,flying:!1,sprintLatched:!1,lastForwardTapMs:Number.NEGATIVE_INFINITY,lookYaw:0,lookPitch:0,hotbarSlot:0,attack:!1,usePresses:0,analogForward:0,analogStrafe:0,lookScale:1}}function fh(i,t,e){const n=t.some(r=>i.held.has(r))?1:0,s=e.some(r=>i.held.has(r))?1:0;return n-s}function ph(i){return Math.max(-1,Math.min(1,i))}function ey(i){const t=ph(fh(i,["KeyW","ArrowUp"],["KeyS","ArrowDown"])+i.analogForward),e=ph(fh(i,["KeyD","ArrowRight"],["KeyA","ArrowLeft"])+i.analogStrafe),n=i.held.has("ControlLeft")||i.held.has("ControlRight");return{forward:t,strafe:e,jump:i.held.has("Space"),sneak:i.held.has("ShiftLeft")||i.held.has("ShiftRight"),sprint:t>0&&(i.sprintLatched||n),fly:i.flying}}function Wd(i,t,e,n){i.locked&&(i.lookYaw-=t*n*i.lookScale,i.lookPitch-=e*n*i.lookScale)}function ny(i){const t={dyaw:i.lookYaw,dpitch:i.lookPitch};return i.lookYaw=0,i.lookPitch=0,t}function Fl(i){i.held.clear(),i.sprintLatched=!1,i.attack=!1,i.usePresses=0,i.analogForward=0,i.analogStrafe=0}function iy(i,t,e){return t===0?(i.attack=e&&i.locked,i.locked):t===2?(e&&i.locked&&i.usePresses++,i.locked):!1}function sy(i){const t=i.usePresses;return i.usePresses=0,t}function Xd(i,t,e){const n=(Math.floor(t)%ke+ke)%ke;n!==i.hotbarSlot&&(i.hotbarSlot=n,e.onHotbarSelect?.(n))}function Bl(i,t,e){i.locked!==t&&(i.locked=t,t||Fl(i),e.onPauseChange?.(!t))}function Yd(i,t,e,n,s,r,o){if(t==="F3")return e&&!n&&r.onToggleDebug?.(),!0;if(t==="KeyE")return e&&!n&&r.onToggleInventory?.(),!0;if(t.startsWith("Digit")){const a=Number(t.slice(5))-1;return Number.isInteger(a)&&a>=0&&a<ke?(e&&!n&&(i.hotbarSlot=a,r.onHotbarSelect?.(a)),!0):!1}return i.locked?t==="KeyF"?(e&&!n&&o.canFly&&(i.flying=!i.flying,r.onFlyChange?.(i.flying)),!0):Qb.has(t)?(e?(t==="KeyW"&&!n&&(s-i.lastForwardTapMs<=Zb&&(i.sprintLatched=!0),i.lastForwardTapMs=s),i.held.add(t)):(i.held.delete(t),t==="KeyW"&&(i.sprintLatched=!1)),!0):!1:(e||i.held.delete(t),!1)}function ry(i,t,e={},n={}){const s=n.sensitivity??Jb,r=n.now??(()=>performance.now()),o={canFly:n.canFly??!1},a=()=>{if(document.pointerLockElement!==i){const _=i.requestPointerLock();_ instanceof Promise&&_.catch(()=>{})}},l=()=>{Bl(t,document.pointerLockElement===i,e)},c=_=>{const p=_.target;if(p instanceof HTMLElement&&(p.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(p.tagName)))return;Yd(t,_.code,_.type==="keydown",_.repeat,r(),e,o)&&_.preventDefault()},u=_=>{Wd(t,_.movementX,_.movementY,s)},h=_=>{iy(t,_.button,_.type==="mousedown")&&_.preventDefault()},d=_=>{!t.locked||_.deltaY===0||(_.preventDefault(),Xd(t,t.hotbarSlot+Math.sign(_.deltaY),e))},f=()=>{Fl(t)},g=_=>{_.preventDefault()};return i.addEventListener("click",a),i.addEventListener("contextmenu",g),document.addEventListener("pointerlockchange",l),document.addEventListener("mousemove",u),document.addEventListener("mousedown",h),document.addEventListener("mouseup",h),window.addEventListener("wheel",d,{passive:!1}),window.addEventListener("keydown",c),window.addEventListener("keyup",c),window.addEventListener("blur",f),()=>{i.removeEventListener("click",a),i.removeEventListener("contextmenu",g),document.removeEventListener("pointerlockchange",l),document.removeEventListener("mousemove",u),document.removeEventListener("mousedown",h),document.removeEventListener("mouseup",h),window.removeEventListener("wheel",d),window.removeEventListener("keydown",c),window.removeEventListener("keyup",c),window.removeEventListener("blur",f),document.pointerLockElement===i&&document.exitPointerLock(),Fl(t)}}const qd=["en","ar"],oy=new Set(["ar"]),Pe=new Map,Ie=new Map;function Ze(i){return i.split("_").map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" ")}const Co={wool:"White Wool",wool_red:"Red Wool",wool_blue:"Blue Wool",wool_yellow:"Yellow Wool",flower_red:"Red Flower",flower_yellow:"Yellow Flower",flower_blue:"Blue Flower",mushroom_red:"Red Mushroom",mushroom_brown:"Brown Mushroom",ferro_lantern:"Ferro Lantern",furnace_lit:"Furnace (Lit)",door_closed:"Oak Door",door_open:"Oak Door (Open)",farmland_wet:"Wet Farmland",dewberry_full:"Dewberry Bush",dewberry_empty:"Dewberry Bush (Empty)",emberlight:"Emberlight",glowshroom:"Glowshroom",understone:"Understone",understone_bricks:"Understone Bricks",permafrost:"Permafrost",frostglass:"Frostglass",ice:"Ice",cactus:"Cactus",wheat_0:"Wheat Sprout",wheat_1:"Young Wheat",wheat_2:"Growing Wheat",wheat_3:"Ripe Wheat",sapling_sable:"Sable Sapling",sapling_pine:"Pine Sapling",sapling_dune:"Dune Willow Sapling",log:"Sable Log",leaves:"Sable Leaves",log_pine:"Pine Log",leaves_pine:"Pine Leaves",log_dune:"Dune Willow Log",leaves_dune:"Dune Willow Leaves",stone_shard:"Stone Shard",cobbled_understone:"Cobbled Understone"},$d={air:"الهواء",stone:"حجر",grass:"عشب",dirt:"تراب",cobblestone:"حجر مكسر",sand:"رمل",sandstone:"حجر رملي",gravel:"حصى",water:"ماء",log:"جذع سابل",leaves:"أوراق سابل",planks:"ألواح خشبية",glass:"زجاج",coal_ore:"خام الفحم",copper_ore:"خام النحاس",ferrite_ore:"خام الفيريت",aurum_ore:"خام الأوروم",aetherite_ore:"خام الإيثريت",ember_ore:"خام الجمر",bedrock:"صخر الأساس",snow_block:"كتلة ثلج",snow_grass:"عشب ثلجي",ice:"جليد",permafrost:"أرض متجمدة",frostglass:"زجاج صقيعي",glowcrystal:"بلورة مضيئة",icicle:"دلاية جليدية",cactus:"صبار",tall_grass:"عشب طويل",flower_red:"زهرة حمراء",flower_yellow:"زهرة صفراء",flower_blue:"زهرة زرقاء",mushroom_red:"فطر أحمر",mushroom_brown:"فطر بني",dead_bush:"شجيرة يابسة",torch:"مشعل",crafting_table:"طاولة صناعة",furnace:"فرن",furnace_lit:"فرن موقَد",chest:"صندوق",bed:"سرير",door_closed:"باب خشبي",door_open:"باب خشبي (مفتوح)",bricks:"طوب",stone_bricks:"طوب حجري",mossy_stone:"حجر مطحلب",sandstone_bricks:"طوب رملي",emberstone:"حجر الجمر",emberstone_bricks:"طوب الجمر",rustrock:"صخر الصدأ",rustrock_bricks:"طوب الصدأ",emberlight:"ضوء الجمر",understone:"حجر الأعماق",understone_bricks:"طوب الأعماق",fume_vent:"فتحة أبخرة",farmland:"أرض زراعية",farmland_wet:"أرض زراعية مبللة",wheat_0:"شتلة قمح",wheat_1:"قمح صغير",wheat_2:"قمح متوسط",wheat_3:"قمح ناضج",log_pine:"جذع صنوبر",leaves_pine:"أوراق صنوبر",log_dune:"جذع صفصاف الدون",leaves_dune:"أوراق صفصاف الدون",clay:"طين",voidrock:"صخر العدم",wool:"صوف أبيض",wool_red:"صوف أحمر",wool_blue:"صوف أزرق",wool_yellow:"صوف أصفر",ferro_lantern:"فانوس فيريتي",campfire:"نار مخيم",glowshroom:"فطر مضيء",crystal_block:"كتلة بلورية",aurum_block:"كتلة أوروم",ferrite_block:"كتلة فيريت",copper_block:"كتلة نحاس",coal_block:"كتلة فحم",sapling_sable:"شتلة سابل",sapling_pine:"شتلة صنوبر",sapling_dune:"شتلة صفصاف الدون",dewberry_full:"نبتة توت الندى",dewberry_empty:"نبتة توت الندى (فارغة)"},ay={stick:"عصا",coal:"فحم",charcoal:"فحم نباتي",raw_ferrite:"فيريت خام",ferrite_ingot:"سبيكة فيريت",raw_copper:"نحاس خام",copper_ingot:"سبيكة نحاس",raw_aurum:"أوروم خام",aurum_ingot:"سبيكة أوروم",aetherite_gem:"جوهرة إيثريت",ember_dust:"غبار الجمر",clay_ball:"كرة طين",brick:"طوبة",stone_shard:"شظية حجر",string:"خيط",leather:"جلد",feather:"ريشة",bone:"عظم",ground_bone:"عظم مطحون",wheat:"قمح",seeds:"بذور",cobbled_understone:"حجر أعماق مكسر"},ly={apple:"تفاحة",bread:"خبز",dewberry:"توت الندى",raw_meat:"لحم نيء",cooked_meat:"لحم مشوي"},cy={pickaxe:"معول",axe:"فأس",shovel:"مجرفة",hoe:"معزقة",sword:"سيف"},uy={head:"خوذة",chest:"درع صدر",legs:"بنطال",feet:"حذاء"},hy={wood:"Wooden",stone:"Stone",ferrite:"Ferrite",aurum:"Aurum",aetherite:"Aetherite"},Kd={wood:"خشبي",stone:"حجري",ferrite:"فيريتي",aurum:"أورومي",aetherite:"إيثريتي"},dy={head:"Helmet",chest:"Chestplate",legs:"Leggings",feet:"Boots"};for(const i of No)i&&(Pe.set(`block.${i.name}`,Co[i.name]??Ze(i.name)),Ie.set(`block.${i.name}`,$d[i.name]??Co[i.name]??Ze(i.name)));for(const i of No)i&&(Yl.has(i.name)||(Pe.set(`item.${i.name}`,Co[i.name]??Ze(i.name)),Ie.set(`item.${i.name}`,$d[i.name]??Ze(i.name))));for(const i of gd)Pe.set(`item.${i}`,Co[i]??Ze(i)),Ie.set(`item.${i}`,ay[i]??Ze(i));for(const i of _d)Pe.set(`item.${i.id}`,Ze(i.id)),Ie.set(`item.${i.id}`,ly[i.id]??Ze(i.id));Pe.set("item.bow","Shortbow");Ie.set("item.bow","قوس قصير");Pe.set("item.arrow","Arrow");Ie.set("item.arrow","سهم");Pe.set("item.ground_bone","Ground Bone");Ie.set("item.ground_bone","عظم مطحون");Pe.set("item.name_tag","Name Tag");Ie.set("item.name_tag","بطاقة تسمية");Pe.set("item.bucket","Bucket");Ie.set("item.bucket","دلو");Pe.set("item.water_bucket","Water Bucket");Ie.set("item.water_bucket","دلو ماء");for(const i of vd)for(const t of xd)Pe.set(`item.${i.name}_${t}`,`${hy[i.name]} ${Ze(t)}`),Ie.set(`item.${i.name}_${t}`,`${cy[t]??Ze(t)} ${Kd[i.name]}`);Pe.set("item.ferrite_shears","Ferrite Shears");Ie.set("item.ferrite_shears","مقص فيريتي");for(const i of Sd)for(const t of Md)Pe.set(`item.${i.name}_${t}`,`${Ze(i.name)} ${dy[t]}`),Ie.set(`item.${i.name}_${t}`,`${uy[t]} ${Kd[i.name]??Ze(i.name)}`);const fy={bramblehog:"Bramblehog",woolback:"Woolback",cluckhen:"Cluckhen",hornbleat:"Hornbleat",cave_crawler:"Cave Crawler",shadewisp:"Shadewisp",rattler:"Rattler",rime_wisp:"Rime Wisp"},py={bramblehog:"شوكي",woolback:"صوفان",cluckhen:"دجاجة",hornbleat:"قرنان",cave_crawler:"زاحف الكهوف",shadewisp:"وهج الظل",rattler:"قعقع",rime_wisp:"وهج الصقيع"};for(const i of hr)Pe.set(`creature.${i.id}`,fy[i.id]??Ze(i.id)),Ie.set(`creature.${i.id}`,py[i.id]??Ze(i.id));const my={ocean:"Ocean",beach:"Beach",plains:"Plains",forest:"Forest",desert:"Desert",mountains:"Mountains",snow_taiga:"Snowy Taiga"},gy={ocean:"محيط",beach:"شاطئ",plains:"سهول",forest:"غابة",desert:"صحراء",mountains:"جبال",snow_taiga:"تايغا ثلجية"};for(const[i,t]of Object.entries(my))Pe.set(`biome.${i}`,t),Ie.set(`biome.${i}`,gy[i]??t);const _y={"ui.play":"Play","ui.new_world":"New World","ui.continue":"Continue","ui.world_name":"World Name","ui.seed":"Seed","ui.seed_placeholder":"leave empty for random","ui.game_mode":"Game Mode","ui.survival":"Survival","ui.creative":"Creative","ui.create":"Create","ui.load":"Load","ui.delete":"Delete","ui.back":"Back","ui.resume":"Resume","ui.settings":"Settings","ui.save_and_quit":"Save and Quit","ui.paused":"Paused","ui.inventory":"Inventory","ui.crafting":"Crafting","ui.creative_inventory":"Creative Inventory","ui.encyclopedia":"Encyclopedia","ui.health":"Health","ui.hunger":"Hunger","ui.breath":"Breath","ui.xp":"Experience","ui.level":"Level","ui.day":"Day","ui.time":"Time","ui.death_title":"You Died","ui.respawn":"Respawn","ui.time_survived":"Time survived","ui.drops_lost":"Your items dropped where you died","ui.language":"Language","ui.render_distance":"Render Distance","ui.fov":"Field of View","ui.mouse_sensitivity":"Mouse Sensitivity","ui.volume_master":"Master Volume","ui.volume_music":"Music Volume","ui.volume_sfx":"Effects Volume","ui.invert_y":"Invert Y Axis","ui.quality":"Graphics Quality","ui.quality_low":"Low","ui.quality_medium":"Medium","ui.quality_high":"High","ui.fullscreen":"Fullscreen","ui.vsync":"VSync","ui.on":"On","ui.off":"Off","ui.keybinds":"Controls","ui.move_forward":"Move Forward","ui.move_back":"Move Back","ui.move_left":"Move Left","ui.move_right":"Move Right","ui.jump":"Jump","ui.sneak":"Sneak","ui.sprint":"Sprint","ui.inventory_key":"Inventory","ui.drop":"Drop Item","ui.attack":"Attack / Mine","ui.use":"Use / Place","ui.pick_block":"Pick Block","ui.toggle_fly":"Toggle Flight (Creative)","ui.encyclopedia_key":"Encyclopedia","ui.recipe_hint":"Recipes you can make are highlighted","ui.smelt":"Smelting","ui.fuel":"Fuel","ui.input":"Input","ui.output":"Output","ui.empty":"Empty","ui.search":"Search","ui.all":"All","ui.blocks":"Blocks","ui.items":"Items","ui.tools":"Tools","ui.armor":"Armor","ui.food":"Food","ui.creatures":"Creatures","ui.biomes":"Biomes","ui.obtained":"Obtained","ui.not_obtained":"Not obtained","ui.how_to_craft":"How to craft","ui.drops":"Drops","ui.hp":"Health","ui.found_in":"Found in","ui.at_y":"Below y =","ui.light":"Light","ui.day_light":"Daylight","ui.night_light":"Nightlight","ui.tool_required":"Tool","ui.any_tool":"Any tool","ui.hand":"Hand","ui.respawn_set":"Respawn point set","ui.sleeping":"Sleeping...","ui.morning":"Good morning!","ui.must_be_night":"You can only sleep at night","ui.monsters_nearby":"There are monsters nearby","ui.renamed":"Renamed to","ui.tamed":"Tamed!","ui.breed_ready":"Love mode","ui.baby_born":"A baby was born!","ui.food_level":"Food","ui.saturation":"Saturation","ui.eat_hint":"Right-click to eat","ui.place_hint":"Right-click to place","ui.no_room":"Not enough room","ui.night_speed":"Sleep to skip the night","ui.saved":"World saved","ui.autosaving":"Autosaving...","ui.loading":"Generating world...","ui.loading_chunks":"Loading chunks...","ui.controls_hint":"WASD move · Space jump · Shift sneak · E inventory · Q drop · F flight (creative) · Esc pause","ui.click_to_play":"Click to Play","ui.release_mouse":"Press Esc to release the mouse","ui.hide_ui":"F1 to hide interface","ui.help":"Help","ui.enable_audio":"Sound","ui.break_blocks":"To break blocks you need","ui.creative_only":"Creative mode only","ui.copied":"Copied to clipboard","ui.unknown_recipe":"No matching recipe","ui.learned":"Learned","ui.muted":"Muted"},vy={"ui.play":"العب","ui.new_world":"عالم جديد","ui.continue":"متابعة","ui.world_name":"اسم العالم","ui.seed":"البذرة","ui.seed_placeholder":"اتركه فارغًا لعشوائية","ui.game_mode":"نمط اللعب","ui.survival":"البقاء","ui.creative":"الإبداع","ui.create":"إنشاء","ui.load":"تحميل","ui.delete":"حذف","ui.back":"رجوع","ui.resume":"استئناف","ui.settings":"الإعدادات","ui.save_and_quit":"حفظ وخروج","ui.paused":"متوقف مؤقتًا","ui.inventory":"حقيبة","ui.crafting":"صناعة","ui.creative_inventory":"حقيبة الإبداع","ui.encyclopedia":"الموسوعة","ui.health":"الصحة","ui.hunger":"الجوع","ui.breath":"النفس","ui.xp":"الخبرة","ui.level":"المستوى","ui.day":"اليوم","ui.time":"الوقت","ui.death_title":"لقد مت","ui.respawn":"إعادة الظهور","ui.time_survived":"مدة البقاء","ui.drops_lost":"سقطت أدواتك حيث مت","ui.language":"اللغة","ui.render_distance":"مسافة العرض","ui.fov":"مجال الرؤية","ui.mouse_sensitivity":"حساسية الفأرة","ui.volume_master":"الصوت العام","ui.volume_music":"الموسيقى","ui.volume_sfx":"المؤثرات الصوتية","ui.invert_y":"اعكس المحور Y","ui.quality":"جودة الرسوميات","ui.quality_low":"منخفضة","ui.quality_medium":"متوسطة","ui.quality_high":"عالية","ui.fullscreen":"ملء الشاشة","ui.vsync":"مزامنة عمودية","ui.on":"تشغيل","ui.off":"إيقاف","ui.keybinds":"التحكم","ui.move_forward":"تقدّم","ui.move_back":"تراجع","ui.move_left":"يسار","ui.move_right":"يمين","ui.jump":"قفز","ui.sneak":"انخفاض","ui.sprint":"عدو","ui.inventory_key":"الحقيبة","ui.drop":"إسقاط العنصر","ui.attack":"هجوم / تعدين","ui.use":"استخدام / وضع","ui.pick_block":"التقاط الكتلة","ui.toggle_fly":"تفعيل الطيران (الإبداع)","ui.encyclopedia_key":"الموسوعة","ui.recipe_hint":"الوصفات المتاحة مميزة","ui.smelt":"صهر","ui.fuel":"وقود","ui.input":"المدخل","ui.output":"المخرج","ui.empty":"فارغ","ui.search":"بحث","ui.all":"الكل","ui.blocks":"كتل","ui.items":"عناصر","ui.tools":"أدوات","ui.armor":"دروع","ui.food":"طعام","ui.creatures":"مخلوقات","ui.biomes":"بيئات","ui.obtained":"تم الحصول عليه","ui.not_obtained":"لم يتم الحصول عليه","ui.how_to_craft":"طريقة الصناعة","ui.drops":"الإسقاطات","ui.hp":"الصحة","ui.found_in":"يتواجد في","ui.at_y":"تحت مستوى","ui.light":"الضوء","ui.day_light":"ضوء النهار","ui.night_light":"ضوء الليل","ui.tool_required":"الأداة","ui.any_tool":"أي أداة","ui.hand":"اليد","ui.respawn_set":"تم تحديد نقطة الظهور","ui.sleeping":"أنت نائم...","ui.morning":"صباح الخير!","ui.must_be_night":"يمكنك النوم في الليل فقط","ui.monsters_nearby":"هناك وحوش قريبة","ui.renamed":"تم التسمية","ui.tamed":"تم الترويض!","ui.breed_ready":"جاهز للتزاوج","ui.baby_born":"وُلد صغير!","ui.food_level":"الشبع","ui.saturation":"الإشباع","ui.eat_hint":"انقر بالزر الأيمن للأكل","ui.place_hint":"انقر بالزر الأيمن للوضع","ui.no_room":"لا توجد مساحة كافية","ui.night_speed":"نم لتخطي الليل","ui.saved":"تم حفظ العالم","ui.autosaving":"جارٍ الحفظ التلقائي...","ui.loading":"جارٍ توليد العالم...","ui.loading_chunks":"جارٍ تحميل المقاطع...","ui.controls_hint":"WASD للحركة · مسافة للقفز · Shift للانخفاض · E للحقيبة · Q للإسقاط · F للطيران (الإبداع) · Esc للإيقاف","ui.click_to_play":"انقر للعب","ui.release_mouse":"اضغط Esc لتحرير الفأرة","ui.hide_ui":"F1 لإخفاء الواجهة","ui.help":"مساعدة","ui.enable_audio":"الصوت","ui.break_blocks":"لكسر هذه الكتلة تحتاج","ui.creative_only":"في نمط الإبداع فقط","ui.copied":"تم النسخ","ui.unknown_recipe":"لا توجد وصفة مطابقة","ui.learned":"مكتشفة","ui.muted":"صامت"};for(const[i,t]of Object.entries(_y))Pe.set(i,t);for(const[i,t]of Object.entries(vy))Ie.set(i,t);const xy={"game.title":"Block World","game.save_now":"Save now","game.new_world_confirm":"Delete this saved world and start again?","game.info_save_loaded":"save loaded","game.info_new_world":"new world","game.info_no_saving":"saving unavailable in this browser","game.controls_desktop":`Left mouse break · Right mouse place or use · Wheel or 1-9 hotbar
WASD move · Space jump · Shift sneak · Ctrl or double-W sprint
E inventory · J encyclopedia · F fly (creative) · F3 debug · Esc pause`,"game.food":"Food","game.air":"Air","game.close":"Close","game.crafting_table":"Crafting table","game.chest":"Chest","game.furnace":"Furnace","game.furnace_slots":"Input · Fuel · Output","game.all_items":"All items","game.furnace_burning":"Fuel {fuel}% · Smelting {smelt}%","game.furnace_idle":"Not burning","game.toast_stronger_tool":"This needs a stronger tool","game.toast_no_support":"Needs a solid block below","game.toast_wrong_soil":"Cannot be planted here","game.toast_hit_by":"Hit by {name} (-{amount})","game.toast_drowning":"You are drowning","game.toast_starving":"You are starving","game.toast_saved":"World saved","game.toast_saved_session":"Saved for this session only","game.toast_save_failed":"Saving failed","game.toast_load_failed":"The saved world could not be loaded. Starting fresh.","game.toast_slept":"You slept through the night. Spawn point set.","game.toast_bed_day":"Spawn point set. You can only sleep at night.","game.death_mob":"You were defeated by a creature.","game.death_fall":"You fell from a high place.","game.death_drown":"You ran out of air.","game.death_starve":"You starved.","game.death_void":"You fell out of the world.","game.death_items":"Your items were dropped where you fell.","game.view_distance":"View distance","game.look_speed":"Look speed","game.hud_size":"HUD size","game.touch_controls":"Touch controls","game.auto":"Auto","game.sound":"Sound","game.settings_note":"Quality sets the default view distance and pixel density. Settings are saved in this browser.","game.language_note":"The new language applies instantly, without saving and reloading.","game.touch_bag":"Bag","game.touch_pause":"Pause","game.touch_sneak":"Sneak","game.touch_break":"Break","game.touch_place":"Place","game.touch_fly":"Fly","game.touch_down":"Down","game.touch_jump":"Jump","game.recipes":"Recipes","game.search_placeholder":"Search by name","game.no_results":"Nothing found","game.entries":"{count} entries","game.fact_hardness":"Hardness {value}","game.fact_unbreakable":"Cannot be broken","game.fact_tool":"Best tool: {tool}","game.fact_tier":"Needs a tool of tier {tier} or better to drop anything","game.fact_drops":"Drops: {items}","game.fact_drops_nothing":"Drops nothing","game.fact_light":"Gives off light level {value}","game.fact_made_by_hand":"Crafted by hand","game.fact_made_at_table":"Crafted at a crafting table","game.fact_ingredients":"Ingredients: {items}","game.fact_makes":"Makes {count} × {item}","game.fact_smelts_into":"Smelts into {item} in {seconds} s","game.fact_smelted_from":"Smelted from {item}","game.fact_used_in":"Used to make: {items}","game.fact_material":"A crafting material","game.fact_fuel":"Burns as fuel for {seconds} s","game.fact_food":"Restores {hunger} food","game.fact_tool_stats":"{kind}, tier {tier}, durability {durability}, damage {damage}","game.fact_health":"Health {value}","game.fact_behaviour_passive":"Peaceful, runs away when hurt","game.fact_behaviour_neutral":"Peaceful until attacked","game.fact_behaviour_hostile":"Hostile at night and in the dark","game.fact_damage":"Attack damage {value}","game.fact_ranged":"Attacks from up to {range} blocks away","game.fact_burns":"Burns in direct sunlight","game.fact_found_in":"Found in: {places}","game.fact_underground":"underground","game.anywhere":"anywhere","game.tool_pickaxe":"Pickaxe","game.tool_axe":"Axe","game.tool_shovel":"Shovel","game.tool_hoe":"Hoe","game.tool_sword":"Sword","game.tool_shears":"Shears"},Sy={"game.title":"عالم الكتل","game.save_now":"احفظ الآن","game.new_world_confirm":"هل تريد حذف هذا العالم المحفوظ والبدء من جديد؟","game.info_save_loaded":"تم تحميل الحفظ","game.info_new_world":"عالم جديد","game.info_no_saving":"الحفظ غير متاح في هذا المتصفح","game.controls_desktop":`زر الفأرة الأيسر للكسر · الأيمن للوضع أو الاستخدام · العجلة أو 1-9 للشريط
WASD للحركة · المسافة للقفز · Shift للتسلل · Ctrl أو W مرتين للركض
E للحقيبة · J للموسوعة · F للطيران (الإبداع) · F3 للتشخيص · Esc للإيقاف`,"game.food":"الطعام","game.air":"الهواء","game.close":"إغلاق","game.crafting_table":"طاولة الصناعة","game.chest":"الصندوق","game.furnace":"الفرن","game.furnace_slots":"المادة · الوقود · الناتج","game.all_items":"كل العناصر","game.furnace_burning":"الوقود {fuel}% · الصهر {smelt}%","game.furnace_idle":"الفرن مطفأ","game.toast_stronger_tool":"تحتاج أداة أقوى","game.toast_no_support":"تحتاج كتلة صلبة تحتها","game.toast_wrong_soil":"لا يمكن زراعتها هنا","game.toast_hit_by":"أصابك {name} (-{amount})","game.toast_drowning":"أنت تغرق","game.toast_starving":"أنت تتضوّر جوعاً","game.toast_saved":"تم حفظ العالم","game.toast_saved_session":"حُفظ لهذه الجلسة فقط","game.toast_save_failed":"فشل الحفظ","game.toast_load_failed":"تعذّر تحميل العالم المحفوظ، فبدأ عالم جديد.","game.toast_slept":"نمت حتى الصباح، وحُدّدت نقطة العودة.","game.toast_bed_day":"حُدّدت نقطة العودة. لا يمكنك النوم إلا ليلاً.","game.death_mob":"هزمك أحد المخلوقات.","game.death_fall":"سقطت من مكان مرتفع.","game.death_drown":"نفد منك الهواء.","game.death_starve":"مت من الجوع.","game.death_void":"سقطت خارج العالم.","game.death_items":"سقطت أغراضك في المكان الذي مت فيه.","game.view_distance":"مدى الرؤية","game.look_speed":"سرعة الالتفات","game.hud_size":"حجم الواجهة","game.touch_controls":"أزرار اللمس","game.auto":"تلقائي","game.sound":"الصوت","game.settings_note":"تحدد الجودة مدى الرؤية الافتراضي ودقة العرض. تُحفظ الإعدادات في هذا المتصفح.","game.language_note":"اللغة الجديدة تُطبَّق فورًا، دون حفظ الصفحة ولا إعادة تحميلها.","game.touch_bag":"الحقيبة","game.touch_pause":"إيقاف","game.touch_sneak":"تسلل","game.touch_break":"كسر","game.touch_place":"وضع","game.touch_fly":"طيران","game.touch_down":"نزول","game.touch_jump":"قفز","game.recipes":"الوصفات","game.search_placeholder":"ابحث بالاسم","game.no_results":"لا توجد نتائج","game.entries":"{count} مدخلاً","game.fact_hardness":"الصلابة {value}","game.fact_unbreakable":"لا يمكن كسرها","game.fact_tool":"الأداة المناسبة: {tool}","game.fact_tier":"تحتاج أداة من المستوى {tier} أو أعلى لتسقط شيئاً","game.fact_drops":"تُسقط: {items}","game.fact_drops_nothing":"لا تُسقط شيئاً","game.fact_light":"تُصدر ضوءاً بمستوى {value}","game.fact_made_by_hand":"تُصنع باليد","game.fact_made_at_table":"تُصنع على طاولة الصناعة","game.fact_ingredients":"المكونات: {items}","game.fact_makes":"تنتج {count} × {item}","game.fact_smelts_into":"تُصهر إلى {item} في {seconds} ث","game.fact_smelted_from":"تُصهر من {item}","game.fact_used_in":"تُستخدم لصنع: {items}","game.fact_material":"مادة للصناعة","game.fact_fuel":"تشتعل وقوداً لمدة {seconds} ث","game.fact_food":"تعيد {hunger} من الطعام","game.fact_tool_stats":"{kind}، المستوى {tier}، المتانة {durability}، الضرر {damage}","game.fact_health":"الصحة {value}","game.fact_behaviour_passive":"مسالم، يهرب إذا أُصيب","game.fact_behaviour_neutral":"مسالم ما لم تهاجمه","game.fact_behaviour_hostile":"عدائي ليلاً وفي الظلام","game.fact_damage":"ضرر الهجوم {value}","game.fact_ranged":"يهاجم من مسافة تصل إلى {range} كتلة","game.fact_burns":"يحترق تحت أشعة الشمس المباشرة","game.fact_found_in":"يوجد في: {places}","game.fact_underground":"تحت الأرض","game.anywhere":"في كل مكان","game.tool_pickaxe":"معول","game.tool_axe":"فأس","game.tool_shovel":"مجرفة","game.tool_hoe":"معزقة","game.tool_sword":"سيف","game.tool_shears":"مقص"};for(const[i,t]of Object.entries(xy))Pe.set(i,t);for(const[i,t]of Object.entries(Sy))Ie.set(i,t);const Lo={en:Pe,ar:Ie},My=[{id:"en",label:"English"},{id:"ar",label:"العربية"}];function jt(i,t,e){let n=Lo[t]?.get(i);if(n===void 0&&(n=Lo.en.get(i)),n===void 0)return i;if(e)for(const[s,r]of Object.entries(e))n=n.split(`{${s}}`).join(String(r));return n}function by(i,t){return jt(`block.${i}`,t)}function nn(i,t){const e=Lo[t]?.get(`item.${i}`);if(e!==void 0)return e;const n=Lo.en.get(`item.${i}`);return n!==void 0?n:jt(`block.${i}`,t)}function jd(i,t){return jt(`creature.${i}`,t)}function yy(i,t){return jt(`biome.${i}`,t)}function Ey(i){return oy.has(i)?"rtl":"ltr"}let Vo="en";function wy(i){for(const t of i){const e=t.toLowerCase().split("-")[0];if(qd.includes(e))return e}return"en"}function Ay(i){return typeof i=="string"&&qd.includes(i)}function mh(i,t=typeof document>"u"?null:document.documentElement){Vo=i,t&&(t.lang=i,t.dir=Ey(i))}function et(i,t){return jt(i,Vo,t)}function Ty(i){return nn(i,Vo)}function Ry(i){return jd(i,Vo)}const Cy=.006,ls=56,Ly=220,gh=10,Py=350,_h="bw-touch-styles",Iy=`
.bw-touch-root{position:absolute;inset:0;z-index:1;pointer-events:none;touch-action:none;-webkit-user-select:none;user-select:none}
.bw-look{position:absolute;inset:0;pointer-events:auto}
.bw-stick{position:absolute;left:calc(18px + env(safe-area-inset-left));bottom:calc(18px + env(safe-area-inset-bottom));width:${ls*2}px;height:${ls*2}px;border-radius:50%;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.3);pointer-events:auto}
.bw-knob{position:absolute;left:50%;top:50%;width:48px;height:48px;margin:-24px 0 0 -24px;border-radius:50%;background:rgba(255,255,255,.45)}
.bw-pad{position:absolute;right:calc(14px + env(safe-area-inset-right));bottom:calc(18px + env(safe-area-inset-bottom));display:grid;grid-template-columns:repeat(3,56px);gap:8px;pointer-events:none}
.bw-tbtn{width:56px;height:56px;border-radius:14px;border:2px solid rgba(255,255,255,.35);background:rgba(12,16,22,.55);color:#eef;font:600 12px/1 var(--ui-font);pointer-events:auto;touch-action:none;display:flex;align-items:center;justify-content:center;text-align:center}
.bw-tbtn.on{background:rgba(80,140,90,.75)}
.bw-top{position:absolute;right:calc(14px + env(safe-area-inset-right));top:calc(12px + env(safe-area-inset-top));display:flex;gap:8px;pointer-events:none}
.bw-touch .bw-bottom{bottom:calc(150px + env(safe-area-inset-bottom))}
.bw-touch .bw-hud{z-index:2}
.bw-touch .bw-hotbar{pointer-events:auto}
`;function Dy(){if(document.getElementById(_h))return;const i=document.createElement("style");i.id=_h,i.textContent=Iy,document.head.append(i)}function Zn(i,t,e,n=""){const s=document.createElement(i);return s.className=t,n&&(s.textContent=n),e.append(s),s}function vh(i,t,e,n){Dy();const s=Zn("div","bw-touch-root hidden",i),r=Zn("div","bw-look",s),o=Zn("div","bw-stick",s),a=Zn("div","bw-knob",o),l=Zn("div","bw-top",s),c=Zn("div","bw-pad",s),u=[],h=(E,P,b)=>{E.addEventListener(P,b),u.push(()=>E.removeEventListener(P,b))};let d=null;const f=(E,P)=>{const b=Math.hypot(E,P),x=b>ls?ls/b:1,L=E*x,B=P*x;a.style.transform=`translate(${L}px,${B}px)`,t.analogStrafe=L/ls,t.analogForward=-B/ls},g=()=>{const E=o.getBoundingClientRect();return{x:E.left+E.width/2,y:E.top+E.height/2}};h(o,"pointerdown",E=>{E.preventDefault(),d=E.pointerId,o.setPointerCapture(E.pointerId);const P=g();f(E.clientX-P.x,E.clientY-P.y)}),h(o,"pointermove",E=>{if(E.pointerId!==d)return;const P=g();f(E.clientX-P.x,E.clientY-P.y)});const _=E=>{E.pointerId===d&&(d=null,f(0,0))};h(o,"pointerup",_),h(o,"pointercancel",_);const p=new Map;h(r,"pointerdown",E=>{E.preventDefault(),r.setPointerCapture(E.pointerId);const P={x:E.clientX,y:E.clientY,startX:E.clientX,startY:E.clientY,start:performance.now(),timer:0,holding:!1};P.timer=window.setTimeout(()=>{Math.hypot(P.x-P.startX,P.y-P.startY)<=gh&&(P.holding=!0,t.attack=t.locked)},Py),p.set(E.pointerId,P)}),h(r,"pointermove",E=>{const P=p.get(E.pointerId);P&&(Wd(t,E.clientX-P.x,E.clientY-P.y,Cy),P.x=E.clientX,P.y=E.clientY)});const m=E=>{const P=p.get(E.pointerId);if(!P)return;p.delete(E.pointerId),window.clearTimeout(P.timer),P.holding&&(t.attack=!1);const b=Math.hypot(E.clientX-P.startX,E.clientY-P.startY);!P.holding&&b<=gh&&performance.now()-P.start<=Ly&&t.locked&&t.usePresses++};h(r,"pointerup",m),h(r,"pointercancel",m);const y=(E,P,b,x)=>{const L=Zn("button","bw-tbtn",E,P);return L.type="button",h(L,"pointerdown",B=>{B.preventDefault(),B.stopPropagation(),L.setPointerCapture(B.pointerId),b()}),x&&(h(L,"pointerup",()=>x()),h(L,"pointercancel",()=>x())),L},M=E=>[()=>t.held.add(E),()=>t.held.delete(E)];y(l,et("game.touch_bag"),()=>e.onToggleInventory?.()),y(l,et("game.touch_pause"),()=>n.onPause());const[A,U]=M("Space"),C=y(c,et("game.touch_sneak"),()=>{const E=!t.held.has("ShiftLeft");E?t.held.add("ShiftLeft"):t.held.delete("ShiftLeft"),C.classList.toggle("on",E)});if(y(c,et("game.touch_break"),()=>t.attack=t.locked,()=>t.attack=!1),y(c,et("game.touch_place"),()=>{t.locked&&t.usePresses++}),n.canFly){const E=y(c,et("game.touch_fly"),()=>{Yd(t,"KeyF",!0,!1,performance.now(),e,{canFly:!0}),E.classList.toggle("on",t.flying)})}else Zn("span","",c);return y(c,et("game.touch_down"),...M("ShiftRight")),y(c,et("game.touch_jump"),A,U),{root:s,setVisible(E){s.classList.toggle("hidden",!E),document.body.classList.toggle("bw-touch",E)},detach(){for(const E of u)E();s.remove(),document.body.classList.remove("bw-touch")}}}const xh={stone:{freq:1700,q:1.2,filter:"bandpass"},dirt:{freq:520,q:.8,filter:"lowpass"},grass:{freq:900,q:.7,filter:"bandpass"},sand:{freq:3200,q:.6,filter:"highpass"},wood:{freq:760,q:3,filter:"bandpass"},plant:{freq:4200,q:.8,filter:"bandpass"},glass:{freq:3600,q:8,filter:"bandpass"},metal:{freq:2400,q:12,filter:"bandpass"},wool:{freq:380,q:.5,filter:"lowpass"},snow:{freq:2600,q:.5,filter:"highpass"},liquid:{freq:700,q:2,filter:"lowpass"},gem:{freq:3e3,q:10,filter:"bandpass"}};function Xs(i,t,e,n=0,s=1){const r=xh[i]??xh.stone;return{type:"noise",filter:r.filter,frequency:r.freq*s,q:r.q,duration:t,gain:e,delay:n}}function Ny(i,t="stone"){switch(i){case"dig":return[Xs(t,.06,.35)];case"break":return[Xs(t,.16,.6),Xs(t,.1,.35,.05,.7)];case"place":return[Xs(t,.08,.5,0,.8),{type:"tone",wave:"sine",from:180,to:120,duration:.07,gain:.25,delay:0}];case"step":return[Xs(t,.05,.18,0,.9)];case"hurt":return[{type:"tone",wave:"square",from:320,to:140,duration:.18,gain:.25,delay:0},{type:"noise",filter:"lowpass",frequency:900,q:.7,duration:.12,gain:.3,delay:0}];case"craft":return[{type:"tone",wave:"triangle",from:660,to:660,duration:.09,gain:.22,delay:0},{type:"tone",wave:"triangle",from:990,to:990,duration:.12,gain:.2,delay:.08}];case"eat":return[0,.12,.24].map(e=>({type:"noise",filter:"bandpass",frequency:1400,q:1.5,duration:.06,gain:.3,delay:e}));case"pickup":return[{type:"tone",wave:"sine",from:700,to:1300,duration:.08,gain:.18,delay:0}];default:return[]}}const Uy=.035;class Oy{ctx=null;master=null;noiseBuffer=null;volume=.7;lastPlayed=new Map;setVolume(t){this.volume=Math.max(0,Math.min(1,t)),this.master&&(this.master.gain.value=this.volume)}get muted(){return this.volume<=0}unlock(){if(this.volume<=0)return;const t=window.AudioContext??window.webkitAudioContext;if(t){if(!this.ctx){this.ctx=new t,this.master=this.ctx.createGain(),this.master.gain.value=this.volume,this.master.connect(this.ctx.destination);const e=Math.floor(this.ctx.sampleRate*.5);this.noiseBuffer=this.ctx.createBuffer(1,e,this.ctx.sampleRate);const n=this.noiseBuffer.getChannelData(0);let s=38177486;for(let r=0;r<e;r++)s=s*1664525+1013904223>>>0,n[r]=s/2147483648-1}this.ctx.state==="suspended"&&this.ctx.resume()}}play(t,e="stone"){const n=this.ctx,s=this.master;if(!n||!s||this.volume<=0||n.state!=="running")return;const r=`${t}:${e}`,o=n.currentTime;if(!(o-(this.lastPlayed.get(r)??-1)<Uy)){this.lastPlayed.set(r,o);for(const a of Ny(t,e)){const l=o+a.delay,c=n.createGain();if(c.gain.setValueAtTime(1e-4,l),c.gain.exponentialRampToValueAtTime(a.gain,l+.005),c.gain.exponentialRampToValueAtTime(1e-4,l+a.duration),c.connect(s),a.type==="noise"&&this.noiseBuffer){const u=n.createBufferSource();u.buffer=this.noiseBuffer;const h=n.createBiquadFilter();h.type=a.filter,h.frequency.value=a.frequency,h.Q.value=a.q,u.connect(h),h.connect(c),u.start(l,Math.random()*.3,a.duration+.02)}else if(a.type==="tone"){const u=n.createOscillator();u.type=a.wave,u.frequency.setValueAtTime(a.from,l),u.frequency.exponentialRampToValueAtTime(Math.max(1,a.to),l+a.duration),u.connect(c),u.start(l),u.stop(l+a.duration+.02)}}}}}const ky=250,Fy=500;class By{raf=0;last=0;accumulator=0;running=!1;frames=0;windowStarted=0;fpsValue=0;tickMs;handlers;constructor(t,e){this.tickMs=t,this.handlers=e}get fps(){return this.fpsValue}get isRunning(){return this.running}start(){this.running||(this.running=!0,this.last=performance.now(),this.windowStarted=this.last,this.frames=0,this.accumulator=0,this.raf=requestAnimationFrame(this.step))}stop(){this.running&&(this.running=!1,cancelAnimationFrame(this.raf))}step=t=>{if(!this.running)return;const e=Math.min(t-this.last,ky);for(this.last=t,this.accumulator+=e;this.accumulator>=this.tickMs;)this.handlers.tick(),this.accumulator-=this.tickMs;this.handlers.render(),this.frames+=1,t-this.windowStarted>=Fy&&(this.fpsValue=this.frames*1e3/(t-this.windowStarted),this.frames=0,this.windowStarted=t),this.raf=requestAnimationFrame(this.step)}}class zy{constructor(t=60){this.window=t}samples=[];add(t){!Number.isFinite(t)||t<0||(this.samples.push(t),this.samples.length>this.window&&this.samples.shift())}get average(){return this.samples.length===0?0:this.samples.reduce((t,e)=>t+e,0)/this.samples.length}get worst(){return this.samples.length===0?0:Math.max(...this.samples)}}function Hy(i,t,e,n,s){return[`Frame ${i.average.toFixed(1)} ms avg  ${i.worst.toFixed(1)} ms worst`,`Draw calls ${t.calls}  triangles ${t.triangles}`,`Geometries ${t.geometries}  textures ${t.textures}`,`Chunks +${e.loadedTotal} -${e.unloadedTotal}  entities ${n}  particles ${s}`]}class Sh{persistent=!1;data=new Map;async get(t){return this.data.get(t)??null}async put(t,e){this.data.set(t,e)}async delete(t){this.data.delete(t)}}const Gy="blockworld",Jn="saves";function Xa(i){return new Promise((t,e)=>{i.onsuccess=()=>t(i.result),i.onerror=()=>e(i.error??new Error("IndexedDB request failed"))})}class fc{constructor(t){this.db=t}persistent=!0;static open(t){return new Promise((e,n)=>{const s=t.open(Gy,1);s.onupgradeneeded=()=>{s.result.objectStoreNames.contains(Jn)||s.result.createObjectStore(Jn)},s.onsuccess=()=>e(new fc(s.result)),s.onerror=()=>n(s.error??new Error("IndexedDB open failed")),s.onblocked=()=>n(new Error("IndexedDB open blocked"))})}async get(t){const e=await Xa(this.db.transaction(Jn,"readonly").objectStore(Jn).get(t));return typeof e=="string"?e:null}async put(t,e){await Xa(this.db.transaction(Jn,"readwrite").objectStore(Jn).put(e,t))}async delete(t){await Xa(this.db.transaction(Jn,"readwrite").objectStore(Jn).delete(t))}}async function Vy(i){if(!i)return new Sh;try{return await fc.open(i)}catch{return new Sh}}function Wy(){return bd().filter(i=>i.kind!=="block"||!ce(i.blockId).creativeHidden).map(i=>i.id)}function Xy(){const i=Wy(),t=()=>i.map(n=>({item:n,count:ur(n)})),e={title:et("game.all_items"),slots:t(),accepts:()=>!1,onChange:()=>{const n=t();for(let s=0;s<n.length;s++)e.slots[s]=n[s]}};return e}const Mh="bw-ui-styles",Yy=1800,qy=`
.bw-hud{position:absolute;inset:0;pointer-events:none;font:13px/1.4 var(--ui-font);color:#e8eef4;--hud-scale:1}
.bw-crosshair{position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;background:linear-gradient(#fff,#fff) center/2px 14px no-repeat,linear-gradient(#fff,#fff) center/14px 2px no-repeat;mix-blend-mode:difference}
.bw-progress{position:absolute;left:50%;top:calc(50% + 16px);width:44px;height:4px;margin-left:-22px;background:rgba(0,0,0,.45);border-radius:2px;overflow:hidden}
.bw-progress>i{display:block;height:100%;width:0;background:#f2f2f2}
.bw-bottom{position:absolute;left:50%;bottom:calc(10px + env(safe-area-inset-bottom));transform:translateX(-50%) scale(var(--hud-scale));transform-origin:50% 100%;display:flex;flex-direction:column;align-items:center;gap:6px}
.bw-vitals{display:flex;gap:18px;font-size:12px;text-shadow:0 1px 2px #000}
.bw-bar{display:flex;align-items:center;gap:6px}
.bw-bar b{display:block;width:92px;height:8px;border-radius:4px;background:rgba(0,0,0,.5);overflow:hidden;border:1px solid rgba(255,255,255,.18)}
.bw-bar b>i{display:block;height:100%}
.bw-hotbar{display:flex;gap:4px;padding:4px;border-radius:10px;background:rgba(12,16,22,.72);border:2px solid rgba(120,140,160,.35)}
.bw-slot{position:relative;width:44px;height:44px;border-radius:6px;background:rgba(255,255,255,.06);border:2px solid transparent;box-sizing:border-box}
.bw-slot.sel{border-color:#f3f6f9;background:rgba(255,255,255,.16)}
.bw-slot img{position:absolute;left:4px;top:4px;width:32px;height:32px;image-rendering:pixelated}
.bw-slot .n{position:absolute;right:3px;bottom:1px;font-size:12px;font-weight:600;text-shadow:0 1px 2px #000,0 0 2px #000}
.bw-slot .d{position:absolute;left:5px;right:5px;bottom:3px;height:3px;background:#222}
.bw-slot .d>i{display:block;height:100%}
.bw-slot .k{position:absolute;left:3px;top:1px;font-size:10px;opacity:.55}
[dir=rtl] .bw-hotbar,[dir=rtl] .bw-grid,[dir=rtl] .bw-debug{direction:ltr}
.bw-debug{position:absolute;left:calc(10px + env(safe-area-inset-left));top:calc(10px + env(safe-area-inset-top));padding:8px 12px;white-space:pre;font:12px/1.5 ui-monospace,Consolas,monospace}
.bw-toast{position:absolute;left:50%;bottom:calc(120px + env(safe-area-inset-bottom));transform:translateX(-50%);padding:6px 14px;border-radius:8px;background:rgba(12,16,22,.85);opacity:0;transition:opacity .2s}
.bw-toast.show{opacity:1}
.bw-screen{position:absolute;inset:0;z-index:3;display:flex;align-items:center;justify-content:center;background:rgba(5,8,12,.55);pointer-events:auto;touch-action:none}
.bw-window{padding:16px 18px;max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);overflow:auto;box-sizing:border-box}
.bw-window h2{margin:0 0 10px;font-size:16px;font-weight:600}
.bw-grid{display:grid;gap:4px;grid-template-columns:repeat(var(--cols),44px)}
.bw-row{display:flex;gap:18px;align-items:center;margin-bottom:12px;flex-wrap:wrap}
.bw-arrow{font-size:22px;opacity:.7}
.bw-sep{height:10px}
.bw-cursor{position:fixed;width:32px;height:32px;pointer-events:none;z-index:10;transform:translate(-16px,-16px)}
.bw-cursor img{width:32px;height:32px;image-rendering:pixelated}
.bw-cursor .n{position:absolute;right:-4px;bottom:-4px;font-size:12px;font-weight:600;text-shadow:0 1px 2px #000}
.bw-menu{display:flex;flex-direction:column;gap:10px;min-width:min(260px,calc(100vw - 32px));max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);overflow:auto;box-sizing:border-box;padding:20px 24px;text-align:center}
.bw-menu h1{margin:0 0 4px;font-size:22px}
.bw-menu p{margin:0;font-size:13px;opacity:.8;white-space:pre-line}
.bw-menu .bw-btn{min-height:44px}
@media (max-width:520px){
.bw-window{padding:10px;max-width:calc(100vw - 16px)}
.bw-window .bw-grid{grid-template-columns:repeat(var(--cols),32px);gap:2px}
.bw-window .bw-slot{width:32px;height:32px}
.bw-window .bw-slot img{left:2px;top:2px;width:24px;height:24px}
.bw-row{gap:10px}
}
`;function Cs(){if(document.getElementById(Mh))return;const i=document.createElement("style");i.id=Mh,i.textContent=qy,document.head.append(i)}function st(i,t="",e){const n=document.createElement(i);return t&&(n.className=t),e?.append(n),n}function zl(i,t,e){if(i.replaceChildren(),!t)return;const n=st("img","",i);n.src=e.urlFor(t.item),n.alt=t.item,n.draggable=!1,i.title=Ty(t.item),t.count>1&&(st("span","n",i).textContent=String(t.count));const s=Ss(t.item);if(s>0&&t.durability!==void 0&&t.durability<s){const r=t.durability/s,o=st("i","",st("span","d",i));o.style.width=`${Math.round(r*100)}%`,o.style.background=`hsl(${Math.round(r*120)},80%,50%)`}}function Hl(i){return i?`${i.item}:${i.count}:${i.durability??""}`:"-"}class $y{constructor(t,e){this.icons=e,Cs(),this.root=st("div","bw-hud",t),this.crosshair=st("div","bw-crosshair hidden",this.root),this.progress=st("div","bw-progress hidden",this.root),this.progressFill=st("i","",this.progress);const n=st("div","bw-bottom",this.root);this.vitals=st("div","bw-vitals",n);const s=(c,u)=>{const h=st("div","bw-bar",this.vitals),d=st("span","",h);d.textContent=c;const f=st("i","",st("b","",h));return f.style.background=u,{row:h,fill:f,label:d}},r=s(et("ui.health"),"#d8443a"),o=s(et("game.food"),"#c98a3a"),a=s(et("game.air"),"#5aa8e0");this.bars={health:r.fill,hunger:o.fill,air:a.fill,airRow:a.row},this.labels={health:r.label,hunger:o.label,air:a.label};const l=st("div","bw-hotbar",n);for(let c=0;c<ke;c++){const u=st("div","bw-slot",l);this.slots.push(u)}this.debug=st("div","bw-panel bw-debug hidden",this.root),this.toastEl=st("div","bw-toast",this.root)}root;crosshair;progress;progressFill;vitals;bars;labels;slots=[];debug;toastEl;hotbarKey="";toastTimer=0;enableHotbarTaps(t){this.slots.forEach((e,n)=>{e.addEventListener("pointerdown",s=>{s.preventDefault(),t(n)})})}setPlaying(t){this.crosshair.classList.toggle("hidden",!t),t||this.setMiningProgress(0)}setHotbar(t,e){const n=`${e}|${t.slice(0,ke).map(Hl).join(",")}`;if(n!==this.hotbarKey){this.hotbarKey=n;for(let s=0;s<ke;s++){const r=this.slots[s];zl(r,t[s]??null,this.icons),st("span","k",r).textContent=String(s+1),r.classList.toggle("sel",s===e)}}}setVitals(t){if(this.vitals.classList.toggle("hidden",t===null),!t)return;const e=(n,s)=>`${Math.max(0,Math.min(100,n/s*100))}%`;this.bars.health.style.width=e(t.health,t.maxHealth),this.bars.hunger.style.width=e(t.hunger,t.maxHunger),this.bars.air.style.width=e(t.air,t.maxAir),this.bars.airRow.classList.toggle("hidden",!t.showAir)}relabel(){this.labels.health.textContent=et("ui.health"),this.labels.hunger.textContent=et("game.food"),this.labels.air.textContent=et("game.air")}setMiningProgress(t){const e=t>0&&t<1;this.progress.classList.toggle("hidden",!e),e&&(this.progressFill.style.width=`${Math.round(t*100)}%`)}toggleDebug(){this.debug.classList.toggle("hidden")}get debugVisible(){return!this.debug.classList.contains("hidden")}setDebug(t){this.debug.textContent=t.join(`
`)}toast(t){this.toastEl.textContent=t,this.toastEl.classList.add("show"),window.clearTimeout(this.toastTimer),this.toastTimer=window.setTimeout(()=>this.toastEl.classList.remove("show"),Yy)}}const Ky={mob:"game.death_mob",fall:"game.death_fall",drown:"game.death_drown",starve:"game.death_starve",void:"game.death_void"};class jy{root;cause;titleEl;itemsEl;respawnBtn;constructor(t,e){Cs(),this.root=st("div","bw-screen hidden",t),this.root.style.background="rgba(90,10,10,.55)";const n=st("div","bw-panel bw-menu",this.root);this.titleEl=st("h1","",n),this.titleEl.textContent=et("ui.death_title"),this.cause=st("p","",n),this.itemsEl=st("p","",n),this.itemsEl.textContent=et("game.death_items");const s=st("button","bw-btn primary",n);s.type="button",s.textContent=et("ui.respawn"),s.addEventListener("click",e),this.respawnBtn=s}relabel(){this.titleEl.textContent=et("ui.death_title"),this.itemsEl.textContent=et("game.death_items"),this.respawnBtn.textContent=et("ui.respawn")}get isVisible(){return!this.root.classList.contains("hidden")}show(t){this.cause.textContent=t?et(Ky[t]):"",this.root.classList.remove("hidden")}hide(){this.root.classList.add("hidden")}}const Jr=32,Zy={1:"#a8793f",2:"#8d8f93",3:"#cfc8bd",4:"#e6b93c",5:"#4fd2c4"},Jy=[["ferrite","#cfc8bd"],["copper","#d0814a"],["aurum","#e6b93c"],["aetherite","#4fd2c4"],["ember","#e2553a"],["coal","#2c2c30"],["charcoal","#3a3330"],["clay","#a9b0bd"],["brick","#a5533a"],["bone","#e8e2cf"],["leather","#8a5a34"],["string","#eeeeee"],["feather","#f4f4f0"],["wheat","#d9bf55"],["seeds","#7aa83f"],["apple","#d23b32"],["bread","#c48a43"],["dewberry","#6a4fc2"],["meat","#c25a4f"],["stone","#8d8f93"],["stick","#8a6236"],["bucket","#b9bec6"]];function te(i,t,e,n,s,r){i.fillStyle=r,i.fillRect(t*2,e*2,n*2,s*2)}function qe(i,t){const e=Number.parseInt(i.slice(1),16),n=Math.min(255,Math.round((e>>16&255)*t)),s=Math.min(255,Math.round((e>>8&255)*t)),r=Math.min(255,Math.round((e&255)*t));return`rgb(${n},${s},${r})`}function js(i,t){for(let e=t;e<14;e++)te(i,14-e,e+1,2,1,"#7a5430")}const Qy={pickaxe:(i,t)=>{js(i,3);for(let e=0;e<9;e++)te(i,4+e,2+Math.abs(4-e)*.5,1,2,t);te(i,9,3,3,2,qe(t,.8))},axe:(i,t)=>{js(i,3),te(i,6,1,5,5,t),te(i,5,2,2,3,qe(t,1.15))},shovel:(i,t)=>{js(i,5),te(i,9,1,5,5,t),te(i,10,2,3,3,qe(t,1.15))},hoe:(i,t)=>{js(i,3),te(i,6,2,6,2,t),te(i,6,4,2,2,qe(t,.8))},sword:(i,t)=>{for(let e=0;e<10;e++)te(i,4+e,11-e,2,2,e<2?"#7a5430":t);te(i,3,9,5,2,qe(t,.7))},shears:(i,t)=>{te(i,3,3,4,8,t),te(i,9,3,4,8,qe(t,.85)),te(i,3,11,4,3,"#a03a32"),te(i,9,11,4,3,"#a03a32")}};function tE(i){for(const[e,n]of Jy)if(i.includes(e))return n;return`hsl(${nS(i.length*131+i.charCodeAt(0)*7+i.charCodeAt(i.length-1))%360},45%,55%)`}function eE(i,t){const e=tE(t),n=Ri(t);if(t==="stick"){js(i,1);return}if(t.endsWith("bucket")){te(i,3,4,10,9,e),te(i,4,12,8,2,qe(e,.8)),t==="water_bucket"&&te(i,4,5,8,3,"#3a74d0");return}if(t.endsWith("_ingot")||t==="brick"){te(i,2,6,12,5,e),te(i,3,5,10,1,qe(e,1.2)),te(i,2,10,12,1,qe(e,.7));return}if(t.endsWith("_gem")||t.endsWith("_dust")){for(let s=0;s<6;s++)te(i,8-s,3+s,s*2,1,e);for(let s=0;s<6;s++)te(i,3+s,9+s,10-s*2,1,qe(e,.75));return}if(t==="seeds"){for(const[s,r]of[[4,5],[9,4],[6,9],[11,9],[8,12]])te(i,s,r,2,2,e);return}if(t==="wheat"){for(let s=0;s<3;s++)te(i,4+s*3,2,2,12,s===1?e:qe(e,.85));return}if(n?.kind==="food"){te(i,4,4,8,9,e),te(i,3,6,10,5,e),te(i,5,5,3,2,qe(e,1.3));return}te(i,3,4,10,9,e),te(i,4,3,8,11,e),te(i,5,5,3,2,qe(e,1.25)),te(i,4,11,8,2,qe(e,.7))}class nE{constructor(t){this.atlas=t}canvases=new Map;urls=new Map;canvasFor(t){const e=this.canvases.get(t);if(e)return e;const n=document.createElement("canvas");n.width=Jr,n.height=Jr;const s=n.getContext("2d");return s&&(s.imageSmoothingEnabled=!1,this.paint(s,t)),this.canvases.set(t,n),n}urlFor(t){const e=this.urls.get(t);if(e)return e;const n=this.canvasFor(t).toDataURL();return this.urls.set(t,n),n}paint(t,e){const n=Ed(e)?yd(e):-1;if(n>0){const r=dc(n,zo),o=r%We*wn,a=(We-1-Math.floor(r/We))*wn;t.drawImage(this.atlas,o,a,wn,wn,0,0,Jr,Jr);return}const s=ci(e);if(s){const r=Qy[s.kind];if(r){r(t,Zy[s.tier]??"#cccccc");return}}eE(t,e)}}function sr(i){return!!i&&i.count>0}function iE(i,t){let e=t,n=t,s=-1,r=-1;for(let c=0;c<t;c++)for(let u=0;u<t;u++)sr(i[c*t+u])&&(u<e&&(e=u),c<n&&(n=c),u>s&&(s=u),c>r&&(r=c));if(s<0||r<0)return null;const o=s-e+1,a=r-n+1,l=[];for(let c=0;c<a;c++)for(let u=0;u<o;u++){const h=i[(c+n)*t+(u+e)];l.push(sr(h)?h:null)}return{width:o,height:a,cells:l}}function sE(i){let t=0;for(const a of i)a.length>t&&(t=a.length);if(t===0)return null;let e=t,n=i.length,s=-1,r=-1;for(let a=0;a<i.length;a++){const l=i[a];for(let c=0;c<l.length;c++)l[c]!==" "&&(c<e&&(e=c),a<n&&(n=a),c>s&&(s=c),a>r&&(r=a))}if(s<0||r<0)return null;const o=[];for(let a=n;a<=r;a++){const l=i[a];let c="";for(let u=e;u<=s;u++)c+=u<l.length?l[u]:" ";o.push(c)}return{width:s-e+1,height:r-n+1,rows:o}}function rE(i,t){const e=sE(i.pattern);if(!e||e.width!==t.width||e.height!==t.height)return!1;for(let n=0;n<e.height;n++)for(let s=0;s<e.width;s++){const r=t.cells[n*t.width+s],o=e.rows[n][s];if(o===" "){if(sr(r))return!1}else{const a=i.key[o];if(!a||!r||r.item!==a)return!1}}return!0}function oE(i,t){const e=new Map;let n=0;for(const s of t.cells)sr(s)&&(n++,e.set(s.item,(e.get(s.item)??0)+1));if(n!==i.ingredients.length)return!1;for(const s of i.ingredients){const r=e.get(s)??0;if(r<=0)return!1;e.set(s,r-1)}return!0}function Zd(i,t){const e=iE(i,t);if(!e)return null;for(const n of ir)if(n.type==="shaped"&&rE(n,e))return n;for(const n of ir)if(n.type==="shapeless"&&oE(n,e))return n;return null}function aE(i,t,e){const n=Math.max(1,ur(t));let s=e;for(;s>0;){const r=i.length>0?i[i.length-1]:void 0;if(r&&r.item===t&&r.count<n){const o=Math.min(n-r.count,s);r.count+=o,s-=o}else{const o=Math.min(n,s);i.push({item:t,count:o}),s-=o}}}function Jd(i,t,e){const n=t*t,s=[];for(let o=0;o<n;o++){const a=i[o];s.push(sr(a)?{item:a.item,count:a.count}:null)}const r=[];for(;;){const o=Zd(s,t);if(!o)break;for(let a=0;a<n;a++){const l=s[a];l&&(l.count-=1,l.count<=0&&(s[a]=null))}aE(r,o.result.item,o.result.count);break}return{output:r,remaining:s}}function Ms(i){return ci(i)?1:Math.max(1,ur(i))}function _e(i,t){if(!i)return null;const e=t??i.count;if(e<=0)return null;const n={item:i.item,count:e};return i.durability!==void 0&&(n.durability=i.durability),n}function Po(i,t){return i.item===t.item&&i.durability===t.durability&&Ms(i.item)>1}function lE(i,t,e){if(e==="left"){if(!t)return{slot:null,cursor:_e(i)};if(!i)return{slot:_e(t),cursor:null};if(Po(i,t)){const n=Ms(i.item)-i.count,s=Math.min(n,t.count);return{slot:_e(i,i.count+s),cursor:_e(t,t.count-s)}}return{slot:_e(t),cursor:_e(i)}}if(!t){if(!i)return{slot:null,cursor:null};const n=Math.ceil(i.count/2);return{slot:_e(i,i.count-n),cursor:_e(i,n)}}return i?Po(i,t)&&i.count<Ms(i.item)?{slot:_e(i,i.count+1),cursor:_e(t,t.count-1)}:{slot:_e(i),cursor:_e(t)}:{slot:_e(t,1),cursor:_e(t,t.count-1)}}function bs(i,t,e,n){let s=_e(t);for(let r=e;r<n&&s;r++){const o=i[r];if(o&&Po(o,s)){const a=Math.min(Ms(o.item)-o.count,s.count);if(a<=0)continue;i[r]=_e(o,o.count+a),s=_e(s,s.count-a)}}for(let r=e;r<n&&s;r++){if(i[r])continue;const o=Math.min(Ms(s.item),s.count);i[r]=_e(s,o),s=_e(s,s.count-o)}return s}function bh(i,t){const e=i[t];if(!e)return!1;const s=t<ke?bs(i,e,ke,i.length):bs(i,e,0,ke);return s&&s.count===e.count?!1:(i[t]=s,!0)}function pc(i,t){const e=Zd(i,t);return!e||e.station==="table"&&t===2?null:{item:e.result.item,count:e.result.count}}function cE(i,t,e){const n=pc(i,t);if(!n||e&&(!Po(e,n)||e.count+n.count>Ms(e.item)))return null;const s=Jd(i,t),r=s.output[0];if(!r)return null;const o=e?_e(e,e.count+r.count):_e(r);return{grid:s.remaining,cursor:o}}function uE(i,t,e){let n=i.map(r=>_e(r)),s=0;for(let r=0;r<64;r++){const o=pc(n,t);if(!o)break;const a=e.map(c=>_e(c));if(bs(a,o,0,a.length))break;const l=Jd(n,t);if(l.output.length===0)break;for(const c of l.output)bs(e,c,0,e.length);n=l.remaining,s+=o.count}return{grid:n,crafted:s}}const hE=4;class dE{constructor(t,e){this.icons=e,Cs(),this.root=st("div","bw-screen hidden",t),this.cursorEl=st("div","bw-cursor hidden",t),this.root.addEventListener("pointerdown",this.onPointerDown),this.root.addEventListener("pointerup",this.onPointerUp),this.root.addEventListener("pointermove",this.onPointerMove),this.root.addEventListener("contextmenu",n=>n.preventDefault())}root;cursorEl;inventory=null;grid=[];craftSize=2;extra;cursor=null;onLeftover=()=>{};dragFrom=null;dragStart={x:0,y:0};elements=new Map;statusEl=null;closeHandler=()=>{};craftHandler=()=>{};setCraftHandler(t){this.craftHandler=t}setCloseHandler(t){this.closeHandler=t}get isOpen(){return this.inventory!==null}open(t,e,n){this.inventory=t,this.craftSize=e.craftSize,this.grid=new Array(e.craftSize*e.craftSize).fill(null),this.extra=e.extra,this.cursor=null,this.onLeftover=n,this.build(e.title),this.root.classList.remove("hidden"),this.refresh()}close(){const t=this.inventory;if(t){for(const e of[...this.grid,this.cursor]){if(!e)continue;const n=t.add(e);n&&this.onLeftover(n)}this.grid=[],this.cursor=null,this.inventory=null,this.extra=void 0,this.root.classList.add("hidden"),this.cursorEl.classList.add("hidden"),this.cursorEl.dataset.stack="-"}}refresh(){if(!this.inventory)return;for(const[n,s]of this.elements){const r=this.stackAt(this.parseKey(n)),o=Hl(r);s.dataset.stack!==o&&(s.dataset.stack=o,zl(s,r,this.icons))}this.statusEl&&this.extra?.render&&(this.statusEl.textContent=this.extra.render());const e=Hl(this.cursor);this.cursorEl.dataset.stack!==e&&(this.cursorEl.dataset.stack=e,this.cursorEl.classList.toggle("hidden",!this.cursor),zl(this.cursorEl,this.cursor,this.icons))}build(t){this.root.replaceChildren(),this.elements.clear();const e=st("div","bw-panel bw-window",this.root),n=st("div","bw-row",e);n.style.justifyContent="space-between",n.style.marginBottom="6px",st("h2","",n).textContent=t;const s=st("button","bw-btn",n);if(s.type="button",s.textContent=et("game.close"),s.addEventListener("click",()=>this.closeHandler()),this.extra){const u=st("div","bw-row",e);st("strong","",u).textContent=this.extra.title;const h=st("div","bw-grid",u),d=Math.min(9,this.extra.slots.length);h.style.setProperty("--cols",String(d)),this.extra.slots.forEach((f,g)=>this.slotEl(h,{kind:"extra",index:g})),this.statusEl=st("span","",u)}else this.statusEl=null;const r=st("div","bw-row",e);st("strong","",r).textContent=et("ui.crafting");const o=st("div","bw-grid",r);o.style.setProperty("--cols",String(this.craftSize)),this.grid.forEach((u,h)=>this.slotEl(o,{kind:"grid",index:h})),st("span","bw-arrow",r).textContent="→",this.slotEl(r,{kind:"output"});const a=st("div","bw-grid",e);a.style.setProperty("--cols",String(ke));const l=this.inventory?.slots.length??0;for(let u=ke;u<l;u++)this.slotEl(a,{kind:"inv",index:u});st("div","bw-sep",e);const c=st("div","bw-grid",e);c.style.setProperty("--cols",String(ke));for(let u=0;u<ke;u++)this.slotEl(c,{kind:"inv",index:u})}slotEl(t,e){const n=st("div","bw-slot",t),s=this.key(e);return n.dataset.slot=s,this.elements.set(s,n),n}key(t){return t.kind==="output"?"output":`${t.kind}:${t.index}`}parseKey(t){if(t==="output")return{kind:"output"};const[e,n]=t.split(":"),s=Number(n);return e==="grid"?{kind:"grid",index:s}:e==="extra"?{kind:"extra",index:s}:{kind:"inv",index:s}}stackAt(t){return t.kind==="inv"?this.inventory?.slots[t.index]??null:t.kind==="grid"?this.grid[t.index]??null:t.kind==="extra"?this.extra?.slots[t.index]??null:pc(this.grid,this.craftSize)}setStack(t,e){t.kind==="inv"&&this.inventory?this.inventory.slots[t.index]=e:t.kind==="grid"?this.grid[t.index]=e:t.kind==="extra"&&this.extra&&(this.extra.slots[t.index]=e,this.extra.onChange?.())}refAt(t){const e=t instanceof HTMLElement?t.closest("[data-slot]"):null;return e?.dataset.slot?this.parseKey(e.dataset.slot):null}apply(t,e,n){const s=this.inventory;if(!s)return;if(t.kind==="output"){if(n){const o=uE(this.grid,this.craftSize,s.slots);this.grid=o.grid,o.crafted>0&&this.craftHandler()}else{const o=cE(this.grid,this.craftSize,this.cursor);o&&(this.grid=o.grid,this.cursor=o.cursor,this.craftHandler())}return}if(t.kind==="extra"&&this.extra?.readOnly?.includes(t.index)&&this.cursor)return;if(n){this.shiftMove(t);return}if(t.kind==="extra"&&this.cursor&&this.extra?.accepts&&!this.extra.accepts(t.index,this.cursor))return;const r=lE(this.stackAt(t),this.cursor,e);this.setStack(t,r.slot),this.cursor=r.cursor}shiftMove(t){const e=this.inventory;if(!e)return;if(t.kind==="inv"){if(this.extra){const s=e.slots[t.index];if(!s)return;const r=this.extra.slots.findIndex((a,l)=>!this.extra?.readOnly?.includes(l)&&(this.extra?.accepts?.(l,s)??!0));if(r<0){bh(e.slots,t.index);return}const o=bs(this.extra.slots,s,r,this.extra.accepts?r+1:this.extra.slots.length);e.slots[t.index]=o,this.extra.onChange?.();return}bh(e.slots,t.index);return}const n=this.stackAt(t);n&&this.setStack(t,bs(e.slots,n,0,e.slots.length))}onPointerDown=t=>{const e=this.refAt(t.target);e&&(t.preventDefault(),this.dragFrom=this.cursor?null:e,this.dragStart={x:t.clientX,y:t.clientY},this.apply(e,t.button===2?"right":"left",t.shiftKey),this.refresh(),this.moveCursor(t))};onPointerUp=t=>{const e=this.dragFrom;if(this.dragFrom=null,!e||!this.cursor||!(Math.hypot(t.clientX-this.dragStart.x,t.clientY-this.dragStart.y)>hE))return;const s=this.refAt(document.elementFromPoint(t.clientX,t.clientY));!s||this.key(s)===this.key(e)||s.kind==="output"||(this.apply(s,"left",!1),this.refresh())};onPointerMove=t=>{this.moveCursor(t)};moveCursor(t){this.cursorEl.style.left=`${t.clientX}px`,this.cursorEl.style.top=`${t.clientY}px`}}class fE{root;menu;heading;infoEl;resume;extras;constructor(t,e){Cs(),this.root=st("div","bw-screen",t),this.menu=st("div","bw-panel bw-menu",this.root),this.heading=st("h1","",this.menu),this.heading.textContent=e.title,this.resume=st("button","bw-btn primary",this.menu),this.resume.type="button",this.resume.textContent=et("ui.play"),this.resume.addEventListener("click",()=>e.onResume()),this.extras=st("div","bw-menu",this.menu),this.extras.style.padding="0",this.extras.style.minWidth="0",this.infoEl=st("p","",this.menu),this.infoEl.textContent=e.info}get isVisible(){return!this.root.classList.contains("hidden")}show(t=et("ui.resume")){this.resume.textContent=t,this.root.classList.remove("hidden")}hide(){this.root.classList.add("hidden")}setInfo(t){this.infoEl.textContent=t}setTitle(t){this.heading.textContent=t}relabel(){this.resume.textContent=et("ui.resume"),this.setTitle(et("game.title"))}setButtons(t){this.extras.replaceChildren();for(const e of t){const n=st("button","bw-btn",this.extras);n.type="button",n.textContent=e.label,n.addEventListener("click",()=>e.onClick())}}}const Qd="blockworld.settings.v1",tf=.2,ef=3,nf=.6,mc=1.5,pE=["low","medium","high"],mE=["auto","on","off"];function Zs(i,t,e){return Math.min(e,Math.max(t,i))}function Qr(i,t){return typeof i=="number"&&Number.isFinite(i)?i:t}function gE(i){const t=i.cores??4,e=i.memoryGb??4;return t<=2||e<=2?"low":i.coarsePointer?t>=8&&e>=6?"medium":"low":t>=8&&e>=8?"high":"medium"}function Gl(i){const t=gE(i);return{quality:t,renderDistance:Li[t].renderDistance,sensitivity:1,hudScale:1,touch:"auto",volume:.7,language:wy(i.languages??[])}}function _E(i,t){const e=Gl(t);if(!i||typeof i!="object")return e;const n=i,s=pE.includes(n.quality)?n.quality:e.quality;return{quality:s,renderDistance:Math.round(Zs(Qr(n.renderDistance,Li[s].renderDistance),Dh,Nh)),sensitivity:Zs(Qr(n.sensitivity,e.sensitivity),tf,ef),hudScale:Zs(Qr(n.hudScale,e.hudScale),nf,mc),touch:mE.includes(n.touch)?n.touch:e.touch,volume:Zs(Qr(n.volume,e.volume),0,1),language:Ay(n.language)?n.language:e.language}}function vE(i,t){if(!i)return Gl(t);try{const e=i.getItem(Qd);return _E(e?JSON.parse(e):null,t)}catch{return Gl(t)}}function xE(i,t){if(!i)return!1;try{return i.setItem(Qd,JSON.stringify(t)),!0}catch{return!1}}function SE(i,t){return{...i,quality:t,renderDistance:Li[t].renderDistance}}function yh(i,t){return i.touch==="on"?!0:i.touch==="off"?!1:t.coarsePointer}function ME(i,t,e){const n=Math.min(1,(i-24)/476,(t-24)/360);return Zs(Math.max(.55,n)*e,.45,mc)}function bE(){const i=navigator,t=typeof window.matchMedia=="function"&&window.matchMedia("(pointer: coarse)").matches;return{cores:typeof i.hardwareConcurrency=="number"?i.hardwareConcurrency:void 0,memoryGb:typeof i.deviceMemory=="number"?i.deviceMemory:void 0,coarsePointer:t||"ontouchstart"in window,languages:navigator.languages?.length?navigator.languages:[navigator.language]}}function yE(){try{return window.localStorage??null}catch{return null}}function Ya(i,t){i.style.setProperty("--hud-scale",String(ME(window.innerWidth,window.innerHeight,t)))}const EE=`
.bw-settings label{display:grid;grid-template-columns:minmax(84px,120px) minmax(90px,1fr) 44px;gap:10px;align-items:center;text-align:left;font-size:14px;min-height:44px}
.bw-settings input[type=range]{width:100%;min-height:32px}
.bw-settings select{font:inherit;font-size:16px;padding:6px 8px;border-radius:6px;background:#1c2630;color:#e8eef4;border:1px solid rgba(140,165,190,.4)}
.bw-settings small{grid-column:1/-1;opacity:.65;font-size:12px}
`;class wE{constructor(t,e,n,s){if(this.onChange=n,Cs(),!document.getElementById("bw-settings-styles")){const a=document.createElement("style");a.id="bw-settings-styles",a.textContent=EE,document.head.append(a)}this.settings=e,this.root=st("div","bw-screen hidden",t);const r=st("div","bw-panel bw-menu bw-settings",this.root);this.heading=st("h1","",r),this.heading.textContent=et("ui.settings"),this.body=st("div","",r);const o=st("button","bw-btn primary",r);o.type="button",o.textContent=et("ui.back"),o.addEventListener("click",s),this.backBtn=o}root;body;heading;backBtn;settings;relabel(){this.heading.textContent=et("ui.settings"),this.backBtn.textContent=et("ui.back"),this.isVisible&&this.render()}get isVisible(){return!this.root.classList.contains("hidden")}show(t){this.settings=t,this.render(),this.root.classList.remove("hidden")}hide(){this.root.classList.add("hidden")}commit(t){this.settings=t,this.onChange(t),this.render()}render(){this.body.replaceChildren();const t=this.settings,e=(r,o,a,l)=>{const c=st("label","",this.body);st("span","",c).textContent=r;const u=st("select","",c);for(const[h,d]of a){const f=st("option","",u);f.value=h,f.textContent=d,f.selected=h===o}st("span","",c),u.addEventListener("change",()=>this.commit(l(u.value)))},n=(r,o,a,l,c,u,h)=>{const d=st("label","",this.body);st("span","",d).textContent=r;const f=st("input","",d);f.type="range",f.min=String(a),f.max=String(l),f.step=String(c),f.value=String(o);const g=st("span","",d);g.textContent=u(o),f.addEventListener("input",()=>g.textContent=u(Number(f.value))),f.addEventListener("change",()=>this.commit(h(Number(f.value))))};e(et("ui.language"),t.language,My.map(r=>[r.id,r.label]),r=>({...t,language:r})),e(et("ui.quality"),t.quality,[["low",et("ui.quality_low")],["medium",et("ui.quality_medium")],["high",et("ui.quality_high")]],r=>SE(t,r)),n(et("game.view_distance"),t.renderDistance,Dh,Nh,1,r=>`${r}`,r=>({...t,renderDistance:r})),n(et("game.look_speed"),t.sensitivity,tf,ef,.1,r=>`${r.toFixed(1)}x`,r=>({...t,sensitivity:r})),n(et("game.hud_size"),t.hudScale,nf,mc,.05,r=>`${Math.round(r*100)}%`,r=>({...t,hudScale:r})),n(et("game.sound"),t.volume,0,1,.05,r=>r<=0?et("ui.off"):`${Math.round(r*100)}%`,r=>({...t,volume:r})),e(et("game.touch_controls"),t.touch,[["auto",et("game.auto")],["on",et("ui.on")],["off",et("ui.off")]],r=>({...t,touch:r}));const s=st("small","",this.body);s.textContent=`${et("game.settings_note")} ${et("game.language_note")}`}}function rr(i,t){return i.join(t==="ar"?"، ":", ")}function sf(i){const t=new Map,e=n=>{t.set(n,(t.get(n)??0)+1)};if(i.type==="shaped")for(const n of i.pattern)for(const s of n){const r=i.key[s];s!==" "&&r&&e(r)}else for(const n of i.ingredients)e(n);return t}function rf(i,t){const e=[...sf(i)].map(([n,s])=>`${s} × ${nn(n,t)}`);return[jt(i.station==="table"?"game.fact_made_at_table":"game.fact_made_by_hand",t),jt("game.fact_ingredients",t,{items:rr(e,t)}),jt("game.fact_makes",t,{count:i.result.count,item:nn(i.result.item,t)})]}function of(i,t){const e=[],n=ci(i);n&&e.push(jt("game.fact_tool_stats",t,{kind:jt(`game.tool_${n.kind}`,t),tier:n.tier,durability:n.durability,damage:n.damage}));const s=So(i);s&&e.push(jt("game.fact_food",t,{hunger:s.hunger}));const r=sc(i);r>0&&e.push(jt("game.fact_fuel",t,{seconds:r}));for(const a of cc)a.input===i&&e.push(jt("game.fact_smelts_into",t,{item:nn(a.output,t),seconds:a.seconds})),a.output===i&&e.push(jt("game.fact_smelted_from",t,{item:nn(a.input,t)}));for(const a of ir)if(a.result.item===i){e.push(...rf(a,t));break}const o=[...new Set(ir.filter(a=>sf(a).has(i)).map(a=>nn(a.result.item,t)))];return o.length>0&&e.push(jt("game.fact_used_in",t,{items:rr(o.slice(0,8),t)})),e.length===0&&e.push(jt("game.fact_material",t)),e}function AE(i,t){const e=[];i.hardness<0?e.push(jt("game.fact_unbreakable",t)):e.push(jt("game.fact_hardness",t,{value:i.hardness})),i.tool&&e.push(jt("game.fact_tool",t,{tool:jt(`game.tool_${i.tool}`,t)})),i.tier>0&&e.push(jt("game.fact_tier",t,{tier:i.tier})),i.drops==="none"?e.push(jt("game.fact_drops_nothing",t)):Array.isArray(i.drops)&&i.drops.length>0&&e.push(jt("game.fact_drops",t,{items:rr(i.drops.map(s=>nn(s.item,t)),t)})),i.lightEmit>0&&e.push(jt("game.fact_light",t,{value:i.lightEmit}));const n=rc(i.id);return n&&e.push(...of(n,t).filter(s=>!e.includes(s))),e}function TE(i,t){const e=[jt("game.fact_health",t,{value:i.health}),jt(`game.fact_behaviour_${i.category}`,t)];i.damage>0&&e.push(jt("game.fact_damage",t,{value:i.damage})),i.ranged&&e.push(jt("game.fact_ranged",t,{range:i.ranged.range})),i.burnsInDaylight&&e.push(jt("game.fact_burns",t));const n=i.spawnBiome.includes("*")?[jt("game.anywhere",t)]:i.spawnBiome.map(s=>yy(s,t));return i.spawnUnderground&&n.push(jt("game.fact_underground",t)),e.push(jt("game.fact_found_in",t,{places:rr(n,t)})),i.drops.length>0&&e.push(jt("game.fact_drops",t,{items:rr(i.drops.map(s=>nn(s.item,t)),t)})),e}function Ys(i,t,e,n,s){return{id:i,category:t,name:e,icon:n,facts:s,search:`${e} ${i}`.toLowerCase()}}function Eh(i){const t=[];for(const e of No)!e||e.id===0||e.creativeHidden||t.push(Ys(`block:${e.name}`,"blocks",by(e.name,i),rc(e.id)??null,AE(e,i)));for(const e of bd())e.kind!=="block"&&t.push(Ys(`item:${e.id}`,"items",nn(e.id,i),e.id,of(e.id,i)));for(const e of hr)t.push(Ys(`creature:${e.id}`,"creatures",jd(e.id,i),null,TE(e,i)));for(const e of ir){const n=Ri(e.result.item)?e.result.item:null;t.push(Ys(`recipe:${e.id}`,"recipes",nn(e.result.item,i),n,rf(e,i)))}for(const e of cc)t.push(Ys(`smelt:${e.input}`,"recipes",nn(e.output,i),e.output,[jt("game.fact_smelts_into",i,{item:nn(e.output,i),seconds:e.seconds}),jt("game.fact_smelted_from",i,{item:nn(e.input,i)})]));return t}function RE(i,t,e){const n=t.trim().toLowerCase();return i.filter(s=>(e==="all"||s.category===e)&&(n===""||s.search.includes(n))).sort((s,r)=>s.name.localeCompare(r.name))}const CE=`
.bw-ency{display:flex;flex-direction:column;width:min(760px,calc(100vw - 16px));height:min(560px,calc(100vh - 16px));padding:12px;box-sizing:border-box;gap:8px}
.bw-ency-head{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.bw-ency-head h2{margin:0;flex:1;font-size:18px}
.bw-ency input{font:inherit;font-size:16px;padding:8px 10px;border-radius:8px;border:1px solid rgba(140,165,190,.4);background:#141b23;color:#e8eef4;min-width:0;flex:1 1 160px}
.bw-ency-tabs{display:flex;gap:6px;flex-wrap:wrap}
.bw-ency-tabs .bw-btn{min-height:40px;padding:6px 12px}
.bw-ency-tabs .bw-btn.on{border-color:#e8eef4}
.bw-ency-body{display:grid;grid-template-columns:minmax(150px,240px) 1fr;gap:10px;min-height:0;flex:1}
.bw-ency-list{overflow:auto;display:flex;flex-direction:column;gap:2px}
.bw-ency-list button{display:flex;align-items:center;gap:8px;min-height:40px;text-align:start;font:inherit;color:inherit;background:rgba(255,255,255,.04);border:1px solid transparent;border-radius:6px;padding:4px 8px;cursor:pointer}
.bw-ency-list button.on,.bw-ency-list button:focus-visible{border-color:#e8eef4;outline:none}
.bw-ency-list img,.bw-ency-detail img{width:28px;height:28px;image-rendering:pixelated}
.bw-ency-cat{margin-inline-start:auto;opacity:.55;font-size:12px}
.bw-ency-detail{overflow:auto;padding:4px 8px}
.bw-ency-detail h3{display:flex;align-items:center;gap:10px;margin:0 0 8px;font-size:18px}
.bw-ency-detail li{margin:4px 0}
@media (max-width:560px){.bw-ency-body{grid-template-columns:1fr;grid-template-rows:minmax(120px,40%) 1fr}}
`;class LE{constructor(t,e,n,s){if(this.icons=e,this.locale=n,Cs(),!document.getElementById("bw-ency-styles")){const h=document.createElement("style");h.id="bw-ency-styles",h.textContent=CE,document.head.append(h)}this.root=st("div","bw-screen hidden",t);const r=st("div","bw-panel bw-ency",this.root),o=st("div","bw-ency-head",r);this.headingEl=st("h2","",o),this.headingEl.textContent=et("ui.encyclopedia"),this.searchEl=st("input","",o),this.searchEl.type="search",this.searchEl.placeholder=et("game.search_placeholder"),this.searchEl.setAttribute("aria-label",et("ui.search")),this.searchEl.addEventListener("input",()=>this.renderList());const a=st("button","bw-btn",o);a.type="button",a.textContent=et("game.close"),a.addEventListener("click",s),this.closeBtn=a;const l=st("div","bw-ency-tabs",r),c=[["all",et("ui.all")],["blocks",et("ui.blocks")],["items",et("ui.items")],["creatures",et("ui.creatures")],["recipes",et("game.recipes")]];for(const[h,d]of c){const f=st("button","bw-btn",l);f.type="button",f.textContent=d,f.addEventListener("click",()=>{this.category=h,this.renderList()}),this.tabs.set(h,f)}const u=st("div","bw-ency-body",r);this.listEl=st("div","bw-ency-list",u),this.listEl.setAttribute("role","listbox"),this.listEl.addEventListener("keydown",this.onListKey),this.detailEl=st("div","bw-ency-detail",u)}root;listEl;detailEl;searchEl;headingEl;closeBtn;tabs=new Map;entries=[];category="all";selected=null;get isOpen(){return!this.root.classList.contains("hidden")}setLocale(t){if(t===this.locale)return;this.locale=t,this.entries=[],this.headingEl.textContent=et("ui.encyclopedia"),this.searchEl.placeholder=et("game.search_placeholder"),this.searchEl.setAttribute("aria-label",et("ui.search")),this.closeBtn.textContent=et("game.close");const e=[["all",et("ui.all")],["blocks",et("ui.blocks")],["items",et("ui.items")],["creatures",et("ui.creatures")],["recipes",et("game.recipes")]];for(const[n,s]of e){const r=this.tabs.get(n);r&&(r.textContent=s)}this.isOpen&&(this.entries=Eh(t),this.renderList())}open(){this.entries.length===0&&(this.entries=Eh(this.locale)),this.root.classList.remove("hidden"),this.renderList(),this.searchEl.focus()}close(){this.root.classList.add("hidden")}renderList(){for(const[e,n]of this.tabs)n.classList.toggle("on",e===this.category);const t=RE(this.entries,this.searchEl.value,this.category);if(this.listEl.replaceChildren(),t.length===0){st("p","",this.listEl).textContent=et("game.no_results"),this.detailEl.replaceChildren();return}(!this.selected||!t.some(e=>e.id===this.selected))&&(this.selected=t[0].id);for(const e of t.slice(0,400)){const n=st("button",e.id===this.selected?"on":"",this.listEl);if(n.type="button",n.dataset.entry=e.id,n.setAttribute("role","option"),e.icon){const s=st("img","",n);s.src=this.icons.urlFor(e.icon),s.alt=""}st("span","",n).textContent=e.name,st("small","bw-ency-cat",n).textContent=this.categoryLabel(e.category),n.addEventListener("click",()=>this.select(e.id))}this.renderDetail()}categoryLabel(t){return et(t==="recipes"?"game.recipes":`ui.${t}`)}select(t){this.selected=t;for(const e of this.listEl.querySelectorAll("button[data-entry]"))e.classList.toggle("on",e.dataset.entry===t);this.renderDetail()}renderDetail(){const t=this.entries.find(s=>s.id===this.selected);if(this.detailEl.replaceChildren(),!t)return;const e=st("h3","",this.detailEl);if(t.icon){const s=st("img","",e);s.src=this.icons.urlFor(t.icon),s.alt=""}st("span","",e).textContent=t.name;const n=st("ul","",this.detailEl);for(const s of t.facts)st("li","",n).textContent=s}onListKey=t=>{if(t.key!=="ArrowDown"&&t.key!=="ArrowUp")return;t.preventDefault();const e=[...this.listEl.querySelectorAll("button[data-entry]")],n=e.findIndex(r=>r.dataset.entry===this.selected),s=e[Math.max(0,Math.min(e.length-1,n+(t.key==="ArrowDown"?1:-1)))];s?.dataset.entry&&(this.select(s.dataset.entry),s.focus())}}function qs(i){return i*i*i*(i*(i*6-15)+10)}function yn(i,t,e){return i+(t-i)*e}const qa=new Int8Array([1,1,0,-1,1,0,1,-1,0,-1,-1,0,1,0,1,-1,0,1,1,0,-1,-1,0,-1,0,1,1,0,-1,1,0,1,-1,0,-1,-1]);class On{perm=new Uint8Array(512);constructor(t){const e=new Uint8Array(256);for(let s=0;s<256;s++)e[s]=s;const n=new Ci(t);for(let s=255;s>0;s--){const r=n.nextInt(s+1),o=e[s];e[s]=e[r],e[r]=o}for(let s=0;s<512;s++)this.perm[s]=e[s&255]}noise2(t,e){const n=Math.floor(t),s=Math.floor(e),r=n&255,o=s&255,a=t-n,l=e-s,c=qs(a),u=qs(l),h=this.perm,d=h[h[r]+o],f=h[h[r]+o+1],g=h[h[r+1]+o],_=h[h[r+1]+o+1],p=this.grad2(d,a,l),m=this.grad2(g,a-1,l),y=this.grad2(f,a,l-1),M=this.grad2(_,a-1,l-1);return yn(yn(p,m,c),yn(y,M,c),u)}noise3(t,e,n){const s=Math.floor(t),r=Math.floor(e),o=Math.floor(n),a=s&255,l=r&255,c=o&255,u=t-s,h=e-r,d=n-o,f=qs(u),g=qs(h),_=qs(d),p=this.perm,m=p[p[p[a]+l]+c],y=p[p[p[a]+l+1]+c],M=p[p[p[a]+l]+c+1],A=p[p[p[a]+l+1]+c+1],U=p[p[p[a+1]+l]+c],C=p[p[p[a+1]+l+1]+c],E=p[p[p[a+1]+l]+c+1],P=p[p[p[a+1]+l+1]+c+1],b=this.grad3(m,u,h,d),x=this.grad3(U,u-1,h,d),L=this.grad3(y,u,h-1,d),B=this.grad3(C,u-1,h-1,d),G=this.grad3(M,u,h,d-1),j=this.grad3(E,u-1,h,d-1),Y=this.grad3(A,u,h-1,d-1),W=this.grad3(P,u-1,h-1,d-1),$=yn(b,x,f),V=yn(L,B,f),ht=yn(G,j,f),ft=yn(Y,W,f),Mt=yn($,V,g),kt=yn(ht,ft,g);return yn(Mt,kt,_)}fbm2(t,e,n,s=2,r=.5){let o=0,a=1,l=1,c=0;for(let u=0;u<n;u++)o+=this.noise2(t*l,e*l)*a,c+=a,a*=r,l*=s;return o/c}fbm3(t,e,n,s,r=2,o=.5){let a=0,l=1,c=1,u=0;for(let h=0;h<s;h++)a+=this.noise3(t*c,e*c,n*c)*l,u+=l,l*=o,c*=r;return a/u}ridged2(t,e,n){let s=0,r=1,o=1,a=0;for(let l=0;l<n;l++){const c=1-Math.abs(this.noise2(t*o,e*o));s+=c*c*r,a+=r,r*=.5,o*=2}return s/a}grad2(t,e,n){const s=t&7,r=s<4?e:n,o=s<4?n:e;return(s&1?-r:r)+(s&2?-o:o)}grad3(t,e,n,s){const r=t%12*3;return qa[r]*e+qa[r+1]*n+qa[r+2]*s}}function Io(i,t,e){return i<t?t:i>e?e:i}function PE(i,t,e){const n=Io((e-i)/(t-i),0,1);return n*n*(3-2*n)}const Wo=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];function af(i,t,e,n){let s=0;for(;s<e.length;){const r=e[s++],o=e[s++],a=e[s++],l=e[s++];for(const c of Wo){const u=r+c[0],h=o+c[1],d=a+c[2],f=i(u,h,d);f!==0&&(f<l?(t(u,h,d,0),e.push(u,h,d,f)):n.push(u,h,d,f))}}e.length=0}function Do(i,t,e,n){let s=0;for(;s<n.length;){const r=n[s++],o=n[s++],a=n[s++],l=n[s++];if(t(r,o,a)===l&&!(l<=1))for(const c of Wo){const u=r+c[0],h=o+c[1],d=a+c[2];if(h<0||h>=qt)continue;const f=i.getBlock(u,h,d),g=Math.max(1,Xl(f)),_=l-g;_<=0||t(u,h,d)<_&&(e(u,h,d,_),n.push(u,h,d,_))}}n.length=0}function IE(i,t,e){let n=ei;for(let s=qt-1;s>=0;s--){const r=i.blocks[Se(t,s,e)],o=Xl(r);o>=15?n=0:n=Math.max(0,n-o),i.skyLight[Se(t,s,e)]=n}i.recomputeHeight(t,e)}function DE(i,t,e,n,s,r){const o=e+s,a=n+r,l=t.cx+s,c=t.cz+r,u=i.getChunkIfLoaded(l,c);if(!u)return qt-1;const h=(o%it+it)%it,d=(a%mt+mt)%mt;return u.columnHeight(h,d)}function wh(i,t){const e=[],n=[];for(let s=0;s<mt;s++)for(let r=0;r<it;r++)IE(t,r,s);for(let s=0;s<mt;s++)for(let r=0;r<it;r++){const o=t.cx*it+r,a=t.cz*mt+s;let l=t.columnHeight(r,s);for(const c of[[1,0],[-1,0],[0,1],[0,-1]]){const u=DE(i,t,o,a,c[0],c[1]);u>l&&(l=u)}l>=qt-1&&(l=qt-2);for(let c=1;c<=l;c++){const u=Se(r,c,s);t.skyLight[u]>0&&e.push(o,c,a,t.skyLight[u])}}for(let s=0;s<qt;s++)for(let r=0;r<mt;r++)for(let o=0;o<it;o++){const a=t.blocks[Se(o,s,r)],l=Uh(a);if(l>0){const c=Se(o,s,r);t.blockLight[c]=l,n.push(t.cx*it+o,s,t.cz*mt+r,l)}}NE(i,t,e,n),Do(i,(s,r,o)=>i.getSkyLight(s,r,o),(s,r,o,a)=>i.setSkyLight(s,r,o,a),e),Do(i,(s,r,o)=>i.getBlockLight(s,r,o),(s,r,o,a)=>i.setBlockLight(s,r,o,a),n)}function NE(i,t,e,n){const s=(o,a)=>{const l=t.cx*it+o,c=t.cz*mt+a;for(let u=0;u<qt;u++){const h=Se(o,u,a),d=t.skyLight[h];d>0&&e.push(l,u,c,d);const f=t.blockLight[h];f>0&&n.push(l,u,c,f)}};for(let o=0;o<it;o++)s(o,0),s(o,mt-1);for(let o=0;o<mt;o++)s(0,o),s(it-1,o);const r=(o,a,l)=>{const c=i.getChunkIfLoaded(o,a);if(c)for(let u=0;u<it;u++){const{lx:h,lz:d}=l(u),f=o*it+h,g=a*mt+d;for(let _=0;_<qt;_++){const p=Se(h,_,d),m=c.skyLight[p];m>0&&e.push(f,_,g,m);const y=c.blockLight[p];y>0&&n.push(f,_,g,y)}}};r(t.cx-1,t.cz,o=>({lx:it-1,lz:o})),r(t.cx+1,t.cz,o=>({lx:0,lz:o})),r(t.cx,t.cz-1,o=>({lx:o,lz:mt-1})),r(t.cx,t.cz+1,o=>({lx:o,lz:0}))}function UE(i,t,e){const n=[],s=[],r=new Int16Array(qt);for(let c=0;c<qt;c++)r[c]=i.getSkyLight(t,c,e);let o=ei;for(let c=qt-1;c>=0;c--){const u=i.getBlock(t,c,e),h=Xl(u);h>=15?o=0:o=Math.max(0,o-h);const d=r[c];d!==o&&(i.setSkyLight(t,c,e,o),o<d&&n.push(t,c,e,d)),d<o&&s.push(t,c,e,o)}for(let c=0;c<qt;c++)for(const u of Wo){const h=t+u[0],d=c+u[1],f=e+u[2];if(d<0||d>=qt)continue;const g=i.getSkyLight(h,d,f);g>0&&s.push(h,d,f,g)}const a=(c,u,h)=>i.getSkyLight(c,u,h),l=(c,u,h,d)=>i.setSkyLight(c,u,h,d);af(a,l,n,s),Do(i,a,l,s)}function OE(i,t,e,n,s){const r=[],o=[],a=i.getBlockLight(t,e,n);a>0&&(i.setBlockLight(t,e,n,0),r.push(t,e,n,a)),s>0&&(i.setBlockLight(t,e,n,s),o.push(t,e,n,s));for(const u of Wo){const h=t+u[0],d=e+u[1],f=n+u[2];if(d<0||d>=qt)continue;const g=i.getBlockLight(h,d,f);g>0&&o.push(h,d,f,g)}const l=(u,h,d)=>i.getBlockLight(u,h,d),c=(u,h,d,f)=>i.setBlockLight(u,h,d,f);af(l,c,r,o),Do(i,l,c,o)}const $a=15,Ka=77,ja=31,kE=601,FE=733,BE=909;class zE{seedInt;campChests=new Set;pHeight;pDetail;pRidge;pMountMask;pTemp;pHumid;pCave;pCave2;pUnderstone;constructor(t){this.seedInt=t>>>0,this.pHeight=new On(this.seedInt+1),this.pDetail=new On(this.seedInt+2),this.pRidge=new On(this.seedInt+3),this.pMountMask=new On(this.seedInt+$a),this.pTemp=new On(this.seedInt+Ka),this.pHumid=new On(this.seedInt+ja),this.pCave=new On(this.seedInt+kE),this.pCave2=new On(this.seedInt+FE),this.pUnderstone=new On(this.seedInt+BE)}mountainMaskAt(t,e){return PE(.12,.52,this.pMountMask.fbm2(t*8e-4+$a,e*8e-4+$a,2))}temperatureAt(t,e,n){return this.pTemp.noise2(t*.0011,e*.0011)*.75+this.pTemp.noise2(t*.004+Ka,e*.004+Ka)*.25-(n-Ye)*.007}humidityAt(t,e){return this.pHumid.noise2(t*.0013+ja,e*.0013+ja)}columnHeight(t,e){const n=this.pHeight.fbm2(t*.0016,e*.0016,4),s=this.pRidge.ridged2(t*.0045,e*.0045,3),r=this.mountainMaskAt(t,e),o=this.pDetail.fbm2(t*.02,e*.02,3),a=Ye+n*12+r*(s*34-4)+o*2.5;return Io(Math.round(a),3,qt-12)}biomeAtColumn(t,e,n){if(n<Ye-1)return Ee.OCEAN;if(n<=Ye+1)return Ee.BEACH;const s=this.mountainMaskAt(t,e);if(n>Ye+26||s>.3&&n>Ye+12)return Ee.MOUNTAINS;const r=this.temperatureAt(t,e,n),o=this.humidityAt(t,e);return r>.18&&o<.15?Ee.DESERT:r<-.25?Ee.SNOW_TAIGA:o>.05?Ee.FOREST:Ee.PLAINS}generateChunk(t){const e=new Int16Array(it*mt),n=new Uint8Array(it*mt);for(let s=0;s<mt;s++)for(let r=0;r<it;r++){const o=t.cx*it+r,a=t.cz*mt+s,l=this.columnHeight(o,a);e[s*it+r]=l;const c=this.biomeAtColumn(o,a,l);n[s*it+r]=c,t.setBiome(r,s,c),this.fillColumn(t,r,s,o,a,l,c)}this.placeOreVeins(t,e),this.decorateCaves(t,n,e),this.decorateSurface(t,n,e),this.placeStructures(t,n,e),t.blocks[Se(0,0,0)]=T.BEDROCK,t.generated=!0,t.recomputeAllHeights(),t.modified=!1}fillColumn(t,e,n,s,r,o,a){const l=ss(a),c=o<=Ye,u=o<Ye-7;t.setBlockRaw(e,0,n,T.BEDROCK);for(let h=1;h<=o;h++){let d;h===o?d=u&&a===Ee.OCEAN?iS(s,r,this.seedInt)<.5?T.GRAVEL:T.SAND:l.topBlock:h>=o-l.fillerDepth?d=l.fillerBlock:h>1&&a===Ee.DESERT&&h>o-6?d=T.SANDSTONE:d=this.understoneTop(s,r)>h?T.UNDERSTONE:T.STONE,this.shouldCarve(s,h,r,o,c)&&(d=T.AIR),d!==T.AIR&&t.setBlockRaw(e,h,n,d)}if(o<Ye)for(let h=o+1;h<=Ye;h++)t.setBlockRaw(e,h,n,T.WATER);l.snow&&!c&&o+1<qt&&this.shouldSnowCap(a,o)&&t.getBlock(e,o+1,n)===T.AIR&&!this.shouldCarve(s,o+1,r,o,c)&&t.setBlockRaw(e,o+1,n,T.SNOW_BLOCK)}shouldSnowCap(t,e){return t===Ee.MOUNTAINS&&e>Ye+16}understoneTop(t,e){return 15+Math.round(this.pUnderstone.fbm2(t*.01,e*.01,2)*7)}shouldCarve(t,e,n,s,r){return e<=1||r&&e>s-5?!1:this.pCave.noise3(t*.05,e*.075,n*.05)>.6||e<40&&this.pCave2.noise3(t*.085,e*.11,n*.085)>.72}placeOreVeins(t,e){const n=new Ci(Js(t.cx,t.cz,this.seedInt^24301)),s=[{ore:T.COAL_ORE,count:10,minY:6,maxY:58,size:8},{ore:T.COPPER_ORE,count:6,minY:6,maxY:46,size:7},{ore:T.FERRITE_ORE,count:5,minY:4,maxY:40,size:6},{ore:T.EMBER_ORE,count:3,minY:4,maxY:30,size:5},{ore:T.AURUM_ORE,count:2,minY:2,maxY:24,size:5},{ore:T.AETHERITE_ORE,count:1,minY:2,maxY:15,size:4}];for(const r of s)for(let o=0;o<r.count;o++){const a=n.nextInt(it),l=n.nextInt(mt),c=e[l*it+a],u=n.intRange(Math.min(r.minY,c-1),Math.min(r.maxY,Math.max(r.minY,c-2)));let h=a,d=u,f=l;const g=n.intRange(Math.max(2,r.size-3),r.size);for(let _=0;_<g;_++){if(d>1&&d<qt){const m=t.getBlock(h,d,f);(m===T.STONE||m===T.UNDERSTONE)&&t.setBlockRaw(h,d,f,r.ore)}const p=n.nextInt(6);p===0&&h<it-1?h++:p===1&&h>0?h--:p===2?d++:p===3?d--:p===4&&f<mt-1?f++:p===5&&f>0&&f--}}}decorateCaves(t,e,n){for(let s=0;s<mt;s++)for(let r=0;r<it;r++){const o=n[s*it+r],a=e[s*it+r],l=ss(a),c=t.cx*it+r,u=t.cz*mt+s,h=Math.min(o-2,52);for(let d=2;d<=h;d++){if(t.getBlock(r,d,s)!==T.AIR)continue;const f=t.getBlock(r,d-1,s),g=t.getBlock(r,d+1,s);if(f===T.AIR||g!==T.AIR)continue;const _=Gu(c,d,u,this.seedInt^51729);(f===T.STONE||f===T.UNDERSTONE||f===T.DIRT||f===T.SAND)&&(_<.012?t.setBlockRaw(r,d,s,T.GLOWSHROOM):_<.016&&d<30&&f===T.UNDERSTONE?t.setBlockRaw(r,d,s,T.GLOWCRYSTAL):_<.02&&d<22&&f===T.UNDERSTONE?t.setBlockRaw(r,d,s,T.FUME_VENT):_<.05&&l.snow&&g===T.AIR&&t.setBlockRaw(r,d,s,T.ICICLE))}}}decorateSurface(t,e,n){for(let s=0;s<mt;s++)for(let r=0;r<it;r++){const o=n[s*it+r],a=ss(e[s*it+r]),l=t.cx*it+r,c=t.cz*mt+s,u=t.getBlock(r,o,s);if(t.getBlock(r,o+1,s)!==T.AIR||u===T.WATER||u===T.AIR)continue;const d=Gu(l,9871,c,this.seedInt);if(u===T.GRASS||u===T.SNOW_GRASS)if(d<a.grassDensity)t.setBlockRaw(r,o+1,s,T.TALL_GRASS);else if(d<a.grassDensity+a.flowerDensity){const f=Dl(l,555,c,this.seedInt)%3;t.setBlockRaw(r,o+1,s,f===0?T.FLOWER_RED:f===1?T.FLOWER_YELLOW:T.FLOWER_BLUE)}else d<a.grassDensity+a.flowerDensity+.004&&t.setBlockRaw(r,o+1,s,T.DEWBERRY_FULL);else if(u===T.SAND&&a.id===Ee.DESERT)if(d<a.cactusDensity){const f=1+Dl(l,999,c,this.seedInt)%3;for(let g=1;g<=f&&o+g<qt;g++)t.setBlockRaw(r,o+g,s,T.CACTUS)}else d<a.cactusDensity+.003&&t.setBlockRaw(r,o+1,s,T.DEAD_BUSH)}this.placeTrees(t,e,n)}placeTrees(t,e,n){const s=new Ci(Js(t.cx,t.cz,this.seedInt^32485));let o=ss(e[mt/2*it+it/2]).treeAttempts;if(o!==0)for(let a=0;a<o;a++){const l=s.intRange(3,it-4),c=s.intRange(3,mt-4),u=n[c*it+l],h=ss(e[c*it+l]);if(h.tree==="none")continue;const d=t.getBlock(l,u,c),f=t.getBlock(l,u+1,c);!(d===h.topBlock||h.tree==="pine"&&(d===T.STONE||d===T.SNOW_GRASS||d===T.PERMAFROST))||f!==T.AIR||h.treeAttempts>4&&!s.chance(.85)||(h.tree==="sable"?this.placeSableTree(t,l,u+1,c,s):h.tree==="pine"?this.placePineTree(t,l,u+1,c,s):h.tree==="dune"&&this.placeDuneTree(t,l,u+1,c,s))}}setIfReplaceable(t,e,n,s,r){if(e<0||e>=it||s<0||s>=mt||n<0||n>=qt)return;const o=t.getBlock(e,n,s);(o===T.AIR||o===T.LEAVES||o===T.LEAVES_PINE||o===T.LEAVES_DUNE||o===T.TALL_GRASS)&&t.setBlockRaw(e,n,s,r)}placeSableTree(t,e,n,s,r){const o=r.intRange(4,5);for(let c=0;c<o;c++)this.setIfReplaceable(t,e,n+c,s,T.LOG);const a=n+o,l=[{dy:-1,r:2},{dy:0,r:2},{dy:1,r:1},{dy:2,r:1}];for(const c of l)for(let u=-c.r;u<=c.r;u++)for(let h=-c.r;h<=c.r;h++)u===0&&h===0&&c.dy<=1||Math.abs(u)===c.r&&Math.abs(h)===c.r&&c.r>1||this.setIfReplaceable(t,e+u,a+c.dy,s+h,T.LEAVES);this.setIfReplaceable(t,e,a+2,s,T.LEAVES)}placePineTree(t,e,n,s,r){const o=r.intRange(6,9);for(let c=0;c<o;c++)this.setIfReplaceable(t,e,n+c,s,T.LOG_PINE);const a=n+o-1;let l=0;for(let c=a+1;c>=n+1;c--){for(let u=-l;u<=l;u++)for(let h=-l;h<=l;h++)u===0&&h===0&&c<=a||Math.abs(u)+Math.abs(h)>l+1||this.setIfReplaceable(t,e+u,c,s+h,T.LEAVES_PINE);l=(l+1)%3}this.setIfReplaceable(t,e,a+1,s,T.LEAVES_PINE)}placeDuneTree(t,e,n,s,r){const o=r.intRange(3,4);for(let l=0;l<o;l++)this.setIfReplaceable(t,e,n+l,s,T.LOG_DUNE);const a=n+o;for(let l=-2;l<=2;l++)for(let c=-2;c<=2;c++)Math.abs(l)===2&&Math.abs(c)===2||this.setIfReplaceable(t,e+l,a,s+c,T.LEAVES_DUNE);for(let l=-1;l<=1;l++)for(let c=-1;c<=1;c++)this.setIfReplaceable(t,e+l,a+1,s+c,T.LEAVES_DUNE);this.setIfReplaceable(t,e,a+2,s,T.LEAVES_DUNE)}placeStructures(t,e,n){const s=new Ci(Js(t.cx,t.cz,this.seedInt^22300)),r=ss(e[mt/2*it+it/2]);if(s.chance(r.boulderChance)){const o=s.intRange(2,it-3),a=s.intRange(2,mt-3),l=n[a*it+o],c=s.intRange(3,7);for(let u=0;u<c;u++){const h=o+s.intRange(-2,2),d=a+s.intRange(-2,2),f=l+s.intRange(0,1);h<0||h>=it||d<0||d>=mt||t.getBlock(h,f,d)===T.AIR&&t.setBlockRaw(h,f,d,s.chance(.6)?T.MOSSY_STONE:T.STONE)}}if(s.chance(r.campChance)){const o=s.intRange(4,it-5),a=s.intRange(4,mt-5),l=n[a*it+o];let c=!0,u=l,h=l;for(let d=-2;d<=2;d++)for(let f=-2;f<=2;f++){const g=n[(a+f)*it+(o+d)];g>u&&(u=g),g<h&&(h=g)}if(u-h>2&&(c=!1),c)for(let d=-2;d<=2&&c;d++)for(let f=-2;f<=2;f++){const g=n[(a+f)*it+(o+d)];if(t.getBlock(o+d,g,a+f)===T.WATER){c=!1;break}const _=Math.min(Ye+2,qt-1);for(let p=g+1;p<=_;p++)if(t.getBlock(o+d,p,a+f)===T.WATER){c=!1;break}if(!c)break}if(c){const d=u;for(let f=-2;f<=2;f++)for(let g=-2;g<=2;g++){const _=t.getBlock(o+f,d,a+g);_!==T.WATER&&_!==T.BEDROCK&&t.setBlockRaw(o+f,d,a+g,T.PLANKS);for(let p=1;p<=3;p++){const m=t.getBlock(o+f,d+p,a+g);m!==T.AIR&&m!==T.PLANKS&&m!==T.WATER&&t.setBlockRaw(o+f,d+p,a+g,T.AIR)}}t.setBlockRaw(o,d+1,a,T.CAMPFIRE),t.setBlockRaw(o+1,d+1,a,T.LOG),t.setBlockRaw(o-1,d+1,a,T.LOG),t.setBlockRaw(o+2,d+1,a+2,T.CHEST),this.campChests.add(`${t.cx*it+o+2},${d+1},${t.cz*mt+a+2}`)}}}}const Qn=ff*Qs;class HE{seedInt;generator;chunks=new Map;storedChunks=new Map;revisions=new Map;time=0;cacheKeys=new Float64Array(16).fill(Number.NaN);cacheChunks=new Array(16).fill(void 0);constructor(t,e){this.seedInt=t>>>0,this.generator=e??new zE(this.seedInt)}chunkAt(t,e){const n=(t*31+e&15)>>>0,s=t*1e5+e;if(this.cacheKeys[n]===s)return this.cacheChunks[n];const r=this.chunks.get(vi(t,e));return this.cacheKeys[n]=s,this.cacheChunks[n]=r,r}invalidateChunkCache(){this.cacheKeys.fill(Number.NaN),this.cacheChunks.fill(void 0)}get loadedChunkCount(){return this.chunks.size}isChunkLoaded(t,e){return this.chunks.has(vi(t,e))}getChunkIfLoaded(t,e){return this.chunkAt(t,e)}ensureChunk(t,e){const n=vi(t,e),s=this.chunks.get(n);if(s)return s;const r=new cx(t,e);this.generator.generateChunk(r);const o=this.storedChunks.get(n);return o&&o.length===r.blocks.length&&(r.blocks.set(o),r.modified=!0,r.recomputeAllHeights(),this.storedChunks.delete(n)),this.chunks.set(n,r),this.invalidateChunkCache(),wh(this,r),r}unloadChunk(t,e){const n=vi(t,e),s=this.chunks.get(n);return s&&(s.modified&&this.storedChunks.set(n,s.blocks.slice()),this.chunks.delete(n),this.invalidateChunkCache()),s}getBlock(t,e,n){if(e<0)return T.BEDROCK;if(e>=qt)return T.AIR;const s=Math.floor(t/it),r=Math.floor(n/mt),o=this.chunkAt(s,r);return o?o.blocks[Se(t-s*it,e,n-r*mt)]:T.AIR}isCampChest(t,e,n){return this.generator.campChests.has(`${t},${e},${n}`)}isBlockLoaded(t,e){return this.isChunkLoaded(Math.floor(t/it),Math.floor(e/mt))}setBlock(t,e,n,s){if(e<1||e>=qt)return!1;const r=Math.floor(t/it),o=Math.floor(n/mt),a=this.chunkAt(r,o);if(!a)return!1;const l=t-r*it,c=n-o*mt;return a.blocks[Se(l,e,c)]===s?!1:(a.setBlockRaw(l,e,c,s),a.recomputeHeight(l,c),this.markMeshArea(t,n),UE(this,t,n),OE(this,t,e,n,Uh(s)),this.bumpRevision(vi(r,o)),!0)}markMeshArea(t,e){const n=Math.floor(t/it),s=Math.floor(e/mt);for(let r=-1;r<=1;r++)for(let o=-1;o<=1;o++){const a=r===0?0:r===1?(n+1)*it-t:t-(n*it-1),l=o===0?0:o===1?(s+1)*mt-e:e-(s*mt-1);if(a*a+l*l>15*15)continue;const c=this.getChunkIfLoaded(n+r,s+o);c&&(c.meshDirty=!0)}}getSkyLight(t,e,n){if(e>=qt)return 15;if(e<0)return 0;const s=Math.floor(t/it),r=Math.floor(n/mt),o=this.chunkAt(s,r);return o?o.skyLight[Se(t-s*it,e,n-r*mt)]:0}setSkyLight(t,e,n,s){if(e<0||e>=qt)return;const r=Math.floor(t/it),o=Math.floor(n/mt),a=this.chunkAt(r,o);a&&a.setSky(t-r*it,e,n-o*mt,s)}getBlockLight(t,e,n){if(e<0||e>=qt)return 0;const s=Math.floor(t/it),r=Math.floor(n/mt),o=this.chunkAt(s,r);return o?o.blockLight[Se(t-s*it,e,n-r*mt)]:0}setBlockLight(t,e,n,s){if(e<0||e>=qt)return;const r=Math.floor(t/it),o=Math.floor(n/mt),a=this.chunkAt(r,o);a&&a.setBlockLight(t-r*it,e,n-o*mt,s)}relightChunk(t){t.skyLight.fill(0),t.blockLight.fill(0),wh(this,t)}applySavedBlocks(t,e,n){const s=this.ensureChunk(t,e);s.blocks.set(n),s.modified=!0,this.bumpRevision(vi(t,e)),s.recomputeAllHeights(),this.relightChunk(s),s.meshDirty=!0}getBiome(t,e){const n=Math.floor(t/it),s=Math.floor(e/mt),r=this.getChunkIfLoaded(n,s);if(r)return r.getBiome(t-n*it,e-s*mt);const o=this.generator.columnHeight(t,e);return this.generator.biomeAtColumn(t,e,o)}columnHeight(t,e){const n=Math.floor(t/it),s=Math.floor(e/mt),r=this.getChunkIfLoaded(n,s);return r?r.columnHeight(t-n*it,e-s*mt):this.generator.columnHeight(t,e)}highestSolidY(t,e){const n=Math.floor(t/it),s=Math.floor(e/mt),r=this.getChunkIfLoaded(n,s);return r?r.topSolidY(t-n*it,e-s*mt):this.generator.columnHeight(t,e)}findSpawn(){const t=(n,s)=>{const r=this.generator.columnHeight(n,s);return this.generator.biomeAtColumn(n,s,r)===Ee.OCEAN||r<=Ye+1?null:{x:n+.5,y:r+1.02,z:s+.5}},e=t(0,0);if(e)return e;for(let n=1;n<=48;n++){const s=[[n,0],[-n,0],[0,n],[0,-n],[n,n],[-n,n],[n,-n],[-n,-n]];for(const[r,o]of s){const a=t(r,o);if(a)return a}}return{x:.5,y:Ye+2,z:.5}}advanceTime(t){this.time+=t}get dayFraction(){const t=this.time%Qn;return(t<0?t+Qn:t)/Qn}get dayFactor(){return Io(.5+.75*Math.sin(this.dayFraction*Math.PI*2),.08,1)}get isNight(){return this.dayFraction>.5}setTimeOfDay(t){const e=Io(t,0,.999);this.time=Math.floor(this.time/Qn)*Qn+Math.floor(e*Qn)}skipToMorning(){this.time=(Math.floor(this.time/Qn)+1)*Qn}chunkRevision(t){return this.revisions.get(t)??0}bumpRevision(t){this.revisions.set(t,(this.revisions.get(t)??0)+1)}modifiedChunkData(){const t=new Map(this.storedChunks);for(const e of this.getModifiedChunks())t.set(vi(e.cx,e.cz),e.blocks);return t}getModifiedChunks(){const t=[];for(const e of this.chunks.values())e.modified&&t.push(e);return t}}const Ah=271828,GE=250;function VE(i){const t=new URLSearchParams(i).get("seed");if(t===null)return Ah;const e=Number(t);return Number.isSafeInteger(e)?e>>>0:Ah}function WE(i){const t=Math.floor((i+.25)%1*24*60);return`${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`}async function XE(){const i=document.querySelector("#game-canvas"),t=document.querySelector("#ui-root");if(!i||!t)throw new Error("Block World requires #game-canvas and #ui-root in index.html");const e=new URLSearchParams(window.location.search),n=new HE(VE(window.location.search)),s=e.get("mode")==="creative"?"creative":"survival",r=await Vy(typeof indexedDB>"u"?void 0:indexedDB),o=MM(n.seedInt,s);let a=null,l="";try{if(a=await yM(r,o),a)for(const[w,zt]of SM(a))n.storedChunks.set(w,zt)}catch(w){a=null,n.storedChunks.clear(),l=w instanceof Error?w.message:String(w),console.warn("Save could not be loaded, starting a new world:",l)}const c=bE(),u=yE();let h=vE(u,c);mh(h.language);let d=yh(h,c);const f=new jb(i,n,{mode:s,quality:h.quality,renderDistance:h.renderDistance});a&&f.restore(a);const g=Number(e.get("time"));e.has("time")&&Number.isFinite(g)&&g>=0&&g<1&&n.setTimeOfDay(g);const _=new nE(f.atlasCanvas);f.attachIcons(_);const p=new $y(t,_),m=new dE(t,_),y=ty();y.lookScale=h.sensitivity;const M=new Oy;M.setVolume(h.volume),f.events.onSound=(w,zt)=>M.play(w,zt);const A=new zy;Ya(p.root,h.hudScale);let U="paused";const C={};let E=0,P=performance.now();const b=()=>{if(M.unlock(),d){Bl(y,!0,C);return}const w=i.requestPointerLock();w instanceof Promise&&w.catch(()=>{})},x=()=>{d?Bl(y,!1,C):document.pointerLockElement===i&&document.exitPointerLock()},L=()=>`${et(f.mode==="creative"?"ui.creative":"ui.survival")} · ${et("ui.seed")} ${n.seedInt} · ${et(r.persistent?a?"game.info_save_loaded":"game.info_new_world":"game.info_no_saving")}

${et("game.controls_desktop")}`,B=new fE(t,{title:et("game.title"),info:L(),onResume:b});B.show(et("ui.play"));const G=w=>{const{x:zt,y:Ft,z:$t}=f.player.state.position;f.drops.spawn(w,zt,Ft+1.2,$t)},j=()=>({title:et("ui.armor"),slots:f.equipment.slots,accepts:(w,zt)=>f.equipment.accepts(w,zt)}),Y=(w,zt,Ft)=>{U="inventory",m.open(f.inventory,{craftSize:w,title:zt,extra:Ft},G),p.setPlaying(!1),x()},W=()=>{m.close(),U="paused",b()};f.events.onMining=w=>{w.kind==="blocked"&&p.toast(et("game.toast_stronger_tool"))},f.events.onInteract=w=>{if(w.kind==="crafting")Y(3,et("game.crafting_table"));else if(w.kind==="bed")p.toast(et(w.slept?"game.toast_slept":"game.toast_bed_day"));else if(w.kind==="container"&&w.state.kind==="chest")Y(2,et("game.chest"),{title:et("game.chest"),slots:w.state.slots});else if(w.kind==="container"&&w.state.kind==="furnace"){const zt=w.state;Y(2,et("game.furnace"),{title:et("game.furnace_slots"),slots:zt.slots,accepts:pS,render:()=>{const Ft=mS(zt);return Ft.lit?et("game.furnace_burning",{fuel:Ft.fuel,smelt:Ft.smelt}):et("game.furnace_idle")}})}};const $=new jy(t,()=>{$.hide(),f.respawn(),b()});f.events.onPlayerDamaged=(w,zt,Ft)=>{Ft?p.toast(et("game.toast_hit_by",{name:Ry(Ft.def.id),amount:w})):zt==="drown"?p.toast(et("game.toast_drowning")):zt==="starve"&&p.toast(et("game.toast_starving"))},f.events.onDeath=w=>{m.isOpen&&m.close(),U="paused",$.show(w),B.hide(),x()},f.events.onPlaceFailed=w=>{w==="no-support"?p.toast(et("game.toast_no_support")):w==="wrong-soil"&&p.toast(et("game.toast_wrong_soil"))};let V=vh(t,y,C,{canFly:f.player.canFly,onPause:x});const ht=new wE(t,h,w=>{const zt=w.language!==h.language;if(h=w,xE(u,h),zt){mh(h.language),B.relabel(),B.setInfo(L()),B.setButtons(nt()),p.relabel(),$.relabel(),ht.relabel(),kt.setLocale(h.language),V.detach(),V=vh(t,y,C,{canFly:f.player.canFly,onPause:x}),V.setVisible(d&&U==="playing");return}f.setRenderDistance(h.renderDistance),f.setPixelRatioCap(Li[h.quality].pixelRatioCap),f.setQuality(h.quality),M.setVolume(h.volume),y.lookScale=h.sensitivity,Ya(p.root,h.hudScale),d=yh(h,c)},()=>{ht.hide(),B.show()}),ft=new EM(Cf,()=>bM(r,o,f.saveFile()));let Mt=!1;const kt=new LE(t,_,h.language,()=>X()),ee=w=>{Mt=w,U="book",B.hide(),p.setPlaying(!1),kt.open(),x()},X=()=>{kt.close(),U="paused",Mt?B.show():b()},nt=()=>[{label:et("ui.encyclopedia"),onClick:()=>ee(!0)},{label:et("ui.settings"),onClick:()=>{B.hide(),ht.show(h)}},{label:et("game.save_now"),onClick:()=>{ft.now().then(()=>p.toast(et(r.persistent?"game.toast_saved":"game.toast_saved_session")),()=>p.toast(et("game.toast_save_failed")))}},{label:et("ui.new_world"),onClick:()=>{window.confirm(et("game.new_world_confirm"))&&(Rt.stop(),r.delete(o).finally(()=>window.location.reload()))}}];B.setButtons(nt()),l&&p.toast(et("game.toast_load_failed")),m.setCloseHandler(()=>W()),m.setCraftHandler(()=>M.play("craft","wood")),p.enableHotbarTaps(w=>Xd(y,w,C)),C.onToggleDebug=()=>p.toggleDebug(),C.onToggleInventory=()=>{m.isOpen?W():U==="playing"&&Y(2,et("ui.inventory"),f.creative?Xy():j())},C.onPauseChange=w=>{if(V.setVisible(d&&!w),!w){m.isOpen&&m.close(),kt.isOpen&&kt.close(),U="playing",B.hide(),p.setPlaying(!0);return}p.setPlaying(!1),!(U==="inventory"||U==="book"||$.isVisible)&&(U="paused",B.show())};const bt=ry(i,y,C,{canFly:f.player.canFly}),gt=w=>{w.code!=="Escape"&&w.target instanceof HTMLInputElement||(w.code==="Escape"&&m.isOpen?(w.preventDefault(),W()):w.code==="Escape"&&kt.isOpen?(w.preventDefault(),X()):w.code==="KeyJ"&&U==="playing"&&!w.repeat&&(w.preventDefault(),ee(!1)))},Rt=new By(Rh,{tick:()=>{f.tick()},render:()=>{const w=performance.now();A.add(w-P),y.locked&&ft.tick((w-P)/1e3),P=w;const zt=ny(y);f.update({move:ey(y),dyaw:zt.dyaw,dpitch:zt.dpitch,attack:y.attack,uses:sy(y),hotbarSlot:y.hotbarSlot,active:y.locked}),f.render(),p.setHotbar(f.inventory.slots,f.inventory.selectedIndex),p.setMiningProgress(f.mining.progress),p.setVitals(f.creative?null:{health:f.stats.health,maxHealth:Si,hunger:f.stats.hunger,maxHunger:Mi,air:f.stats.air,maxAir:Ei,showAir:f.stats.air<Ei}),m.isOpen&&m.refresh();const Ft=performance.now();if(p.debugVisible&&Ft-E>=GE){E=Ft;const $t=f.player.state,wt=$t.position,me=Math.floor(wt.x),Lt=Math.floor(wt.y),Dt=Math.floor(wt.z),R=f.streamStats,v=$t.flying?"fly":$t.inWater?"swim":$t.onGround?"ground":"air",H=f.target?`${f.target.x} ${f.target.y} ${f.target.z} ${ce(n.getBlock(f.target.x,f.target.y,f.target.z)).name}`:"none";p.setDebug([`FPS ${Rt.fps.toFixed(0)}  ${f.mode}`,`XYZ ${wt.x.toFixed(2)} ${wt.y.toFixed(2)} ${wt.z.toFixed(2)}  ${v}`,`Biome ${bo[n.getBiome(me,Dt)]?.name??"unknown"}`,`Light sky ${n.getSkyLight(me,Lt,Dt)} block ${n.getBlockLight(me,Lt,Dt)}`,`Time ${WE(n.dayFraction)}  day ${(n.dayFactor*100).toFixed(0)}%`,`Chunks ${R.loaded} loaded  ${R.pending} pending`,`Creatures ${f.entities.entities.length}  night ${n.isNight?"yes":"no"}`,`Facing yaw ${($t.yaw*180/Math.PI).toFixed(0)} pitch ${($t.pitch*180/Math.PI).toFixed(0)}  target ${H}`,...Hy(A,{calls:f.renderer.info.render.calls,triangles:f.renderer.info.render.triangles,geometries:f.renderer.info.memory.geometries,textures:f.renderer.info.memory.textures},R,f.entities.entities.length,f.particles.particles.length),`Sound ${M.muted?"off":"on"}  quality ${f.quality}`])}}}),Ut=()=>{f.resize(Math.max(1,window.innerWidth),Math.max(1,window.innerHeight)),Ya(p.root,h.hudScale)},Xt=()=>{document.visibilityState==="hidden"&&ft.now()},pe=()=>{ft.now(),Rt.stop(),bt(),V.detach(),f.dispose()};window.addEventListener("resize",Ut),window.addEventListener("keydown",gt),window.addEventListener("pagehide",pe,{once:!0}),document.addEventListener("visibilitychange",Xt),Ut(),Rt.start()}function Th(){XE().catch(i=>{console.error("Block World failed to start:",i)})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Th,{once:!0}):Th();
