/* ============================================================
   Donnees geographiques du Cameroun
   Regions > Departements > Arrondissements > Quartiers
   ============================================================ */

var GEO = {
  centre: {
    label: 'Centre',
    depts: {
      mfoundi:      { label: 'Mfoundi',      arronds: { yaounde1:'Yaoundé 1er', yaounde2:'Yaoundé 2ème', yaounde3:'Yaoundé 3ème', yaounde4:'Yaoundé 4ème', yaounde5:'Yaoundé 5ème', yaounde6:'Yaoundé 6ème', yaounde7:'Yaoundé 7ème' } },
      lekie:        { label: 'Lékié',         arronds: { monatele:'Monatélé', batchenga:'Batchenga', ebebda:'Ebebda', esse:'Essé', evodoula:'Evodoula', lobo:'Lobo', obala:'Obala', okola:'Okola', saa:'Sa\'a' } },
      haute_sanaga: { label: 'Haute-Sanaga',  arronds: { nanga_eboko:'Nanga Eboko', bibey:'Bibey', minta:'Minta', mbandjock:'Mbandjock' } },
      mbam_et_inoubou:{ label: 'Mbam et Inoubou', arronds: { bafia:'Bafia', kon_yambetta:'Kon Yambetta', deuk:'Deuk', ombessa:'Ombessa', makak:'Makak' } },
      nyong_et_kelle:{ label: "Nyong et Kellé", arronds: { eseka:'Eséka', messondo:'Messondo', nguibassal:"Ngu'ibassal", ngog_mapubi:'Ngog-Mapubi' } },
      nyong_et_mfoumou:{ label: "Nyong et Mfoumou", arronds: { akonolinga:'Akonolinga', ayos:'Ayos', ngoyla:'Ngoyla' } },
      nyong_et_so:  { label: 'Nyong et So\'o', arronds: { mbalmayo:'Mbalmayo', akono:'Akono', ngomedzap:'Ngomedzap', nkolmetet:'Nkolmetet' } },
      mefou_et_afamba:{ label: 'Méfou et Afamba', arronds: { nkolafamba:'Nkolafamba', awae:'Awaé', biyouha:'Biyouha', yaounde_lekie:'Soa' } },
      mefou_et_akono:{ label: 'Méfou et Akono', arronds: { ngoumou:'Ngoumou', mfou:'Mfou', adzope:'Dzeng' } },
    }
  },
  littoral: {
    label: 'Littoral',
    depts: {
      wouri:        { label: 'Wouri',         arronds: { douala1:'Douala 1er', douala2:'Douala 2ème', douala3:'Douala 3ème', douala4:'Douala 4ème', douala5:'Douala 5ème', douala6:'Douala 6ème' } },
      mungo:        { label: 'Mungo',          arronds: { nkongsamba:'Nkongsamba', loum:'Loum', melong:'Mélong', mbanga:'Mbanga', njombe_penja:'Njombé-Penja' } },
      nkam:         { label: 'Nkam',           arronds: { yabassi:'Yabassi', yingui:'Yingui', ngambe:'Ngambé', ndom:'Ndom', dibombari:'Dibombari' } },
      sanaga_maritime:{ label: 'Sanaga-Maritime', arronds: { edea:'Edéa', mouanko:'Mouanko', nyanon:"Ndog Pendé", ngambe2:'Dizangué' } },
    }
  },
  ouest: {
    label: 'Ouest',
    depts: {
      mifi:         { label: 'Mifi',           arronds: { bafoussam1:'Bafoussam 1er', bafoussam2:'Bafoussam 2ème', bafoussam3:'Bafoussam 3ème' } },
      bamboutos:    { label: 'Bamboutos',       arronds: { mbouda:'Mbouda', galim:'Galim', batcham:'Batcham', babadjou:'Babadjou' } },
      menoua:       { label: 'Ménoua',          arronds: { dschang:'Dschang', nkong_zem:'Nkong-Zem', foreke_dschang:'Foréké-Dschang', kekem:'Kékem' } },
      noun:         { label: 'Noun',            arronds: { foumban:'Foumban', massangam:'Massangam', foumbot:'Foumbot', kouoptamo:'Kouoptamo' } },
      hauts_plateaux:{ label: 'Hauts-Plateaux', arronds: { baham:'Baham', bangangte:'Bangangté', bangou:'Bangou' } },
      nde:          { label: 'Ndé',             arronds: { bangangte2:'Bangangté', bassamba:'Bassamba', tonga:'Tonga' } },
    }
  },
  nord_ouest: {
    label: 'Nord-Ouest',
    depts: {
      mezam:        { label: 'Mezam',           arronds: { bamenda1:'Bamenda 1er', bamenda2:'Bamenda 2ème', bamenda3:'Bamenda 3ème', santa:'Santa', tubah:'Tubah' } },
      boyo:         { label: 'Boyo',            arronds: { fundong:'Fundong', njinikom:'Njinikom' } },
      bui:          { label: 'Bui',             arronds: { kumbo:'Kumbo', nkor:'Nkor', jakiri:'Jakiri' } },
      donga_mantung:{ label: 'Donga-Mantung',   arronds: { nkambe:'Nkambe', ako:'Ako', misaje:'Misajé' } },
    }
  },
  sud_ouest: {
    label: 'Sud-Ouest',
    depts: {
      fako:         { label: 'Fako',            arronds: { buea:'Buea', limbe1:'Limbe 1er', limbe2:'Limbe 2ème', limbe3:'Limbe 3ème', muyuka:'Muyuka', tiko:'Tiko' } },
      kupe_manenguba:{ label: 'Kupe-Manenguba', arronds: { bangem:'Bangem', nguti:'Nguti', tombel:'Tombel' } },
      lebialem:     { label: 'Lebialem',        arronds: { fontem:'Fontem', wabane:'Wabane' } },
      manyu:        { label: 'Manyu',           arronds: { mamfe:'Mamfé', eyumojock:'Eyumojock', akwaya:'Akwaya' } },
      meme:         { label: 'Mémé',            arronds: { kumba1:'Kumba 1er', kumba2:'Kumba 2ème', kumba3:'Kumba 3ème', mbonge:'Mbonge' } },
      ndian:        { label: 'Ndian',           arronds: { mundemba:'Mundemba', nguti2:'Nguti', ekondo_titi:'Ekondo-Titi' } },
    }
  },
  adamaoua: {
    label: 'Adamaoua',
    depts: {
      vina:         { label: 'Vina',            arronds: { ngaoundere1:'Ngaoundéré 1er', ngaoundere2:'Ngaoundéré 2ème', ngaoundere3:'Ngaoundéré 3ème', belel:'Bélel', martap:'Martap' } },
      djerem:       { label: 'Djérem',          arronds: { tibati:'Tibati', ngaoundal:'Ngaoundal' } },
      faro_et_deo:  { label: 'Faro et Déo',     arronds: { tignere:'Tignère', galim_tignere:'Galim-Tignère', kontcha:'Kontcha' } },
      mayo_banyo:   { label: 'Mayo-Banyo',       arronds: { banyo:'Banyo', mayo_darle:'Mayo-Darlé' } },
      mbere:        { label: 'Mbéré',           arronds: { meiganga:'Meiganga', dir:'Dir', ngaoui:'Ngaoui' } },
    }
  },
  nord: {
    label: 'Nord',
    depts: {
      benoue:       { label: 'Bénoué',          arronds: { garoua1:'Garoua 1er', garoua2:'Garoua 2ème', garoua3:'Garoua 3ème', lagdo:'Lagdo', ngong:'Ngong' } },
      faro:         { label: 'Faro',            arronds: { poli:'Poli', tchollire:'Tcholliré' } },
      mayo_louti:   { label: 'Mayo-Louti',       arronds: { guider:'Guider', mayo_oulo:'Mayo-Oulo' } },
      mayo_rey:     { label: 'Mayo-Rey',         arronds: { tchollire2:'Rey-Bouba', touboro:'Touboro' } },
    }
  },
  extreme_nord: {
    label: 'Extrême-Nord',
    depts: {
      diamare:      { label: 'Diamaré',         arronds: { maroua1:'Maroua 1er', maroua2:'Maroua 2ème', maroua3:'Maroua 3ème', meri:'Méri', pette:'Pette' } },
      mayo_kani:    { label: 'Mayo-Kani',        arronds: { kaele:'Kaélé', moutourwa:'Moutourwa', mindif:'Mindif' } },
      mayo_sava:    { label: 'Mayo-Sava',        arronds: { mora:'Mora', kolofata:'Kolofata', tokombere:'Tokombéré' } },
      mayo_tsanaga: { label: 'Mayo-Tsanaga',     arronds: { mokolo:'Mokolo', koza:'Koza', mozogo:'Mozogo', bourha:'Bourha' } },
      logone_et_chari:{ label: 'Logone-et-Chari',arronds: { kousseri:'Kousseri', makary:'Makary', waza:'Waza' } },
      mandara:      { label: 'Mandara',          arronds: { kousserme:'Kousserme' } },
    }
  },
  est: {
    label: 'Est',
    depts: {
      lom_et_djerem:{ label: 'Lom et Djérem',   arronds: { bertoua1:'Bertoua 1er', bertoua2:'Bertoua 2ème', betare_oya:'Bétaré-Oya', doume:'Doumé' } },
      boumba_et_ngoko:{ label: 'Boumba et Ngoko',arronds: { yokadouma:'Yokadouma', moloundou:'Moloundou', gari_gombo:'Gari-Gombo' } },
      haut_nyong:   { label: 'Haut-Nyong',       arronds: { abong_mbang:'Abong-Mbang', doumaintang:'Doumaintang', lomie:'Lomié', mindourou:'Mindourou' } },
      kadey:        { label: 'Kadey',            arronds: { batouri:'Batouri', kentzou:'Kentzou', mbang:'Mbang' } },
    }
  },
  sud: {
    label: 'Sud',
    depts: {
      dja_et_lobo:  { label: 'Dja et Lobo',     arronds: { sangmelima:'Sangmélima', bengbis:'Bengbis', djoum:'Djoum', meyomessi:'Meyomessi', mintom:'Mintom' } },
      mvila:        { label: 'Mvila',            arronds: { ebolowa1:'Ebolowa 1er', ebolowa2:'Ebolowa 2ème', ambam:'Ambam', ma_an:'Ma\'an', olamze:'Olamzé' } },
      ocean:        { label: 'Océan',            arronds: { kribi:'Kribi', akom2:'Akom II', campo:'Campo', lokoundje:'Lokoundjé', bipindi:'Bipindi' } },
      vallee_du_ntem:{ label: "Vallée du Ntem",  arronds: { ma_an2:'Kié-Ossi', meyo_centro:'Meyo-Centro' } },
    }
  }
};

var QUARTIERS = {
  yaounde1: ['Bastos','Nlongkak','Mvog-Ada','Elig-Effa','Messa','Biyem-Assi (1er)','Omnisport'],
  yaounde2: ['Briqueterie','Mimboman','Nkolbisson','Ekounou','Djoungolo'],
  yaounde3: ['Efoulan','Biyem-Assi','Essos','Nkoldongo','Tsinga','Ngousso'],
  yaounde4: ['Kondengui','Nkolmesseng','Odza','Nkol Eton','Mvog-Betsi'],
  yaounde5: ['Nkolbisson','Ahala','Biteng','Mfandena','Awae'],
  yaounde6: ['Mendong','Mvog-Betsi Sud','Nkolbisson Ouest','Mvolye','Ngoa-Ekelle'],
  yaounde7: ['Nkomo','Simbock','Mfou Road','Tsinga Sud'],
  douala1:  ['Akwa','Bonanjo','Bali','Bonapriso','New Bell (1er)','Makepe'],
  douala2:  ['New Bell','Deido','Ndog Bong','Ngangue','Village'],
  douala3:  ['Logbessou','Pk8','Pk10','Nkongmondo','Japoma','Nyalla'],
  douala4:  ['Bonaberi','Bekoko','Ngwelles','Mbanya'],
  douala5:  ['Kotto','Bepanda','Ndog Passi','Cite des Palmiers','Ndogbong'],
  douala6:  ['Youpwe','Ndog Houl','Mabanda','New Deido'],
  bafoussam1:['Banengo','Famla','Djeleng','Tougang','Tamdja'],
  bafoussam2:['Kamkop','Ngouache','Ngui','Lafa'],
  bafoussam3:['Djeleng II','Langkem','Bayangam'],
  bamenda1: ['Up Station','Commercial Avenue','Old Town','Hospital Area'],
  bamenda2: ['Nkwen','Ntarikon','Atuazire','Mankon'],
  bamenda3: ['Chomba','Mile 4','Mbatu','Akum'],
  buea:     ['Molyko','Bonduma','Clerks Quarter','Mile 17','Wokoko','Great Soppo'],
  limbe1:   ['Limbe Town','Down Beach','Church Street','Unity Quarter'],
  limbe2:   ['Bota','Mabeta','New Town'],
  limbe3:   ['Mile 4','Cassava Farm','Small Soppo'],
  maroua1:  ['Domayo','Djarengol','Dogba','Doualare','Kakatare'],
  maroua2:  ['Palar','Boudoum','Lopere','Founangue'],
  maroua3:  ['Dougoi','Ngassa','Bogo Route'],
  garoua1:  ['Bibemire','Poumpoumre','Djamboutou','Roumde Adjia'],
  garoua2:  ['Plateau','Foulbere','Lainde Karewa'],
  garoua3:  ['Bockle','Roumde Haoussa','Ngaoundal Route'],
  ngaoundere1:['Dang','Joli-Soir','Bea','Bamyanga'],
  ngaoundere2:['Lakounbe','Porndji','Grand Marche'],
  ngaoundere3:['Bali','Beka','Mbaboum'],
  bertoua1: ['Haoussa','Bororos','Gbiti','Gendarmerie'],
  bertoua2: ['Madagascar','Nkolbikon','Pagne'],
  ebolowa1: ['Angale','Nko\'ovos','Nkoadjap'],
  ebolowa2: ['Nkoulou','Biba','Mvangan'],
  kribi:    ['Centre ville','Mokolo Beach','Bidou','Mpalla'],
  nkongsamba:['Haoussa','Bafang Route','Bonaberi Road'],
  default:  ['Centre ville','Quartier administratif','Marche central','Zone residentielle','Zone industrielle','Autre quartier']
};

function getQuartiers(arrondId) {
  return QUARTIERS[arrondId] || QUARTIERS['default'];
}
