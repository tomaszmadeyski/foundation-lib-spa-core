import { Component, ReactText } from 'react';
import { Method } from 'axios';
import IContent from './Models/IContent';
import ContentLink from './Models/ContentLink';
import IEpiserverContext from './Core/IEpiserverContext';
import IContentDeliveryAPI from './ContentDelivery/IContentDeliveryAPI';
import NetworkErrorData from './ContentDelivery/NetworkErrorData';
import ActionResponse from './ContentDelivery/ActionResponse';
import { readPropertyValue, readPropertyExpandedValue } from './Property';
/**
 * Base properties to be applied to every Episerver component
 */
export interface ComponentProps<T extends IContent> {
    /**
     * The IContent data object for this component
     */
    data: T;
    /**
     * The width for this component
     */
    width?: number;
    /**
     * The height for this component
     */
    height?: number;
    /**
     * Additional classnames assigned to this component
     */
    className?: string;
    /**
     * The unique identifier of this component
     */
    key?: ReactText;
    /**
     * The link to the content item shown by this component
     */
    contentLink: ContentLink;
    /**
     * The type context to be used, typical values are null, empty string or "block"
     */
    contentType?: string;
    /**
     * The property name shown by this component
     */
    propertyName?: string;
    /**
     * The controller action name to be used
     */
    actionName?: string;
    /**
     * The controller action data to be used
     */
    actionData?: unknown;
    /**
     * Legacy application context, kept as argument for now. Used when provided
     * resolved at runtime otherwise.
     *
     * @deprecated
     */
    context?: IEpiserverContext;
    /**
     * The current path being rendered
     */
    path?: string;
    /**
     * The identifier of the component, if provided
     */
    id?: string;
}
/**
 * Type do describe a generic EpiComponent type
 */
export declare type EpiClassComponentType<T extends IContent = IContent> = new (props: ComponentProps<T>) => EpiClassComponent<T>;
/**
 * Base abstract class to be used by components representing an Episerver IContent component (e.g. Block, Page, Media,
 * Catalog, Product, etc...)
 */
export declare abstract class EpiClassComponent<T extends IContent = IContent, S = Record<string, unknown>> extends Component<ComponentProps<T>, S> {
    /**
     * The component name as injected by the ComponentLoader
     */
    static displayName: string;
    protected currentComponentId: number;
    protected currentComponentGuid: string;
    protected read: typeof readPropertyValue;
    protected readExpanded: typeof readPropertyExpandedValue;
    constructor(props: ComponentProps<T>);
    protected getInitialState?(): S;
    protected componentInitialize?(): void;
    /**
     * Return if debug mode is active
     */
    protected isDebugActive(): boolean;
    /**
     * Returns true for OPE only
     */
    protected isEditable(): boolean;
    /**
     * Returns true for OPE & Preview
     */
    protected isInEditMode(): boolean;
    /**
     * Retrieve the ContentLink for this component
     */
    protected getCurrentContentLink(): ContentLink;
    protected getContext(): IEpiserverContext;
    protected getContentDeliveryApi(): IContentDeliveryAPI;
    /**
     * Invoke a method on the underlying controller for this component, using strongly typed arguments and responses.
     *
     * @param method The (Case sensitive) name of the method to invoke on the controller for this component
     * @param verb The HTTP method to use when invoking, defaults to 'GET'
     * @param args The data to send (will be converted to JSON)
     */
    protected invokeTyped<TypeIn, TypeOut>(method: string, verb?: Method, args?: TypeIn): Promise<ActionResponse<TypeOut | NetworkErrorData<unknown>>>;
    /**
     * Invoke a method on the underlying controller for this component
     *
     * @param method The (Case sensitive) name of the method to invoke on the controller for this component
     * @param verb The HTTP method to use when invoking, defaults to 'GET'
     * @param args The data to send (will be converted to JSON)
     */
    protected invoke(method: string, verb?: Method, args?: Record<string, unknown>): Promise<ActionResponse<unknown>>;
    protected htmlObject(htmlValue: string): {
        __html: string;
    };
}
export default EpiClassComponent;
