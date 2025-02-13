/*! Copyright 2025 Adobe
All Rights Reserved. */
import{FetchGraphQL as y}from"@dropins/tools/fetch-graphql.js";const{setEndpoint:m,setFetchGraphQlHeader:h,removeFetchGraphQlHeader:g,setFetchGraphQlHeaders:I,fetchGraphQl:d,getConfig:$}=new y().getMethods(),l=`
    query GetRecommendations(
        $pageType: PageType!
        $category: String
        $currentSku: String
        $cartSkus: [String]
        $userPurchaseHistory: [PurchaseHistory]
        $userViewHistory: [ViewHistory]
    ) {
        recommendations(
            cartSkus: $cartSkus
            category: $category
            currentSku: $currentSku
            pageType: $pageType
            userPurchaseHistory: $userPurchaseHistory
            userViewHistory: $userViewHistory
        ) {
            results {
                displayOrder
                pageType
                productsView {
                    name
                    sku
                    url
                    images {
                        url
                    }
                    externalId
                    urlKey
                    __typename
                }
                storefrontLabel
                totalProducts
                typeId
                unitId
                unitName
            }
            totalResults
        }
    }

`;function c(s,r){var o,p;if(!((o=s==null?void 0:s.recommendations)!=null&&o.results))return[];let u=(p=s.recommendations)==null?void 0:p.results,t=[];return r!=null&&r.typeId&&(u=u.filter(e=>r.typeId?e.typeId===r.typeId:!0)),u.forEach(e=>{const n=[];e.productsView.forEach(a=>{n.push({name:a.name,sku:a.sku,url:a.url,images:a.images,urlKey:a.urlKey,__typename:a.__typename})}),t.push({unitId:e.unitId,unitName:e.unitName,totalProducts:e.totalProducts,pageType:e.pageType,typeId:e.typeId,storefrontLabel:e.storefrontLabel,displayOrder:e.displayOrder,productsView:n})}),t.length>1&&(t=[t[0]]),t}const H=async(s,r,u,t,o,p,e)=>{const{data:n}=await d(l,{method:"GET",variables:{pageType:s,category:t,currentSku:r,cartSkus:u,userPurchaseHistory:o,userViewHistory:p}});return c(n,e)};export{h as a,I as b,H as c,d as f,$ as g,g as r,m as s};
