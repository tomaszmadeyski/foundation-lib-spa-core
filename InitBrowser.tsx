import ReactDOM from "react-dom";
import React from "react";
import CmsSite from './Components/CmsSite';
import AppConfig from './AppConfig';
import getGlobal from './AppGlobal';
import EpiContext from './Spa';
import ComponentPreLoader, { ImplementationPreLoader } from "./Loaders/ComponentPreLoader";
import IServiceContainer, { DefaultServices } from './Core/IServiceContainer';
import ISchemaInfo from './Core/IContentSchema'
import DefaultServiceContainer from './Core/DefaultServiceContainer';
import IEpiserverContext from "./Core/IEpiserverContext";

export async function InitBrowser(config: AppConfig, containerId?: string, serviceContainer?: IServiceContainer, preload?: ImplementationPreLoader) : Promise<void>
{
    // First we wait untill the browser has created the intial data object
    await whenInitialDataReady();

    // the we create the context and resolve the container object
    const ctx = await whenContextReady(config, serviceContainer);

    // Now load the schema and get the render target
    const [, container] = await Promise.all([
        whenSchemaReady(ctx),
        whenContainerReady(ctx, containerId)
    ]);

    // With the context & schema, determine the rendering function
    const renderer = await whenRendererSelected(ctx, container, preload);

    // Now start the application
    return startSpa(renderer, container, ctx);
}

async function whenSchemaReady(ctx : IEpiserverContext) : Promise<ISchemaInfo> {
    if(ctx.isDebugActive()) console.debug("Awaiting IContent Schema")
    const container = await ctx.serviceContainer.getService<ISchemaInfo>(DefaultServices.SchemaInfo).whenReady
    if(ctx.isDebugActive()) console.debug("IContent Schema ready")
    return container;
}

function whenInitialDataReady() : Promise<void> {
    return new Promise<void>((resolve, reject) => {
        try {
            const glbl = getGlobal();
            if (glbl.__INITIAL__DATA__?.status === 'loading')
                glbl.__INITIAL__DATA__.onReady = () => resolve();
            else
                resolve();
        } catch (e) {
            reject(e);
        }
    });
}

function whenContainerReady(ctx: IEpiserverContext, containerId?: string) : Promise<HTMLElement>
{
    return new Promise((resolve, reject) => {
        if (ctx.isDebugActive()) console.debug('Looking for container element with id:', containerId);
        try {
            let container = document.getElementById(containerId ? containerId : "epi-page-container");
            if (!container) 
            {
                if (ctx.isDebugActive()) console.debug('No container element found, generating and injecting new one');
                container = document.createElement("div");
                container.id = "epi-page-container";
                document.body.append(container);
            }
            resolve(container);
        } catch(e) {
            reject(e);
        }
    });
}

function whenContextReady(config: AppConfig, serviceContainer?: IServiceContainer): Promise<IEpiserverContext>
{
    return new Promise((resolve, reject) => {
        try {
            if (config?.enableDebug === true) console.debug('Initializing Optimizely Content Cloud');
            EpiContext.init(config, serviceContainer || new DefaultServiceContainer());
            return resolve(EpiContext);
        } catch (e) {
            reject(e);
        }
    });
}

async function whenRendererSelected(ctx: IEpiserverContext, container: HTMLElement, preload?: ImplementationPreLoader) : Promise<ReactDOM.Renderer>
{
    if (ctx.isDebugActive()) console.debug('Selecting Renderer');

    if (container.childElementCount > 0) {
        if (ctx.isDebugActive()) console.debug('Elements in container, preloading components');
        try {
            if (!preload) 
                await ComponentPreLoader.load(ctx.config().preLoadComponents || [], ctx.componentLoader());
            else
                await ComponentPreLoader.loadComponents(preload, ctx.componentLoader());
            if (ctx.isDebugActive())
                console.debug('Elements in container, select ReactDOM.hydrate');
            return ReactDOM.hydrate;
        } catch (e) {
            if (ctx.isDebugActive())
                console.warn('Error while preloadinging components, fallback to ReactDOM.render', e);
            return ReactDOM.render;
        }
    }

    if (ctx.isDebugActive()) console.debug('Empty container, select: ReactDOM.render');
    return ReactDOM.render;
}

function startSpa(render: ReactDOM.Renderer, container: HTMLElement, ctx: IEpiserverContext) : Promise<void>
{
    return new Promise((resolve, reject) => {
        try {
            if (ctx.isDebugActive()) console.debug('Start application');
            render(<CmsSite context={ ctx } />, container);
            resolve();
        } catch (e) {
            reject(e);
        }
    });
}

export default InitBrowser;