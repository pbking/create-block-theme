import SidebarSection from "./sidebar-section";
import apiFetch from "@wordpress/api-fetch";
import { useEffect, useState } from "@wordpress/element";
import { __ } from '@wordpress/i18n';
import {
    // eslint-disable-next-line
    __experimentalVStack as VStack,
	// eslint-disable-next-line
    __experimentalHStack as HStack,
    // eslint-disable-next-line
    __experimentalSpacer as Spacer,
    // eslint-disable-next-line
    __experimentalText as Text,
    // eslint-disable-next-line
    __experimentalHeading as Heading,
    // eslint-disable-next-line
    __experimentalItemGroup as ItemGroup,
    // eslint-disable-next-line
    __experimentalItem as Item,
    Button,
    DropdownMenu,
    MenuGroup,
    MenuItem,
    // eslint-disable-next-line
    __experimentalConfirmDialog as ConfirmDialog,
    // eslint-disable-next-line
    __experimentalInputControl as InputControl,
} from '@wordpress/components';

import { store as coreStore } from '@wordpress/core-data';
import { trash, moreVertical, plusCircleFilled, pencil } from '@wordpress/icons';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

	

function ThemeVariations () {
    const { createErrorNotice, createSuccessNotice } = useDispatch( noticesStore );
    const [variation, setVariation] = useState(null);
    const [confirmActionIsOpen, setConfirmActionIsOpen] = useState(false);
    const [action, setAction] = useState(null);


    const [variations, setVariations] = useState([]);

    useEffect(() => {
        const getVariations = async () => {
            const requestOptions = {
                path: `/create-block-theme/v1/theme-variations`,
            };
            const data = await apiFetch(requestOptions);
            setVariations( data );
        };
        getVariations();
    }, []);

    const handleAskConfirm = (action, variation) => {
        setAction(action);
        setVariation( variation );
        setConfirmActionIsOpen(true);
    }

    const applyChange = async () => {
        let method = "GET";
        let requestData = {};
        switch (action) {
            case "new":
                method = "POST";
                break;
            case "delete":
                method = "DELETE";
                requestData.file = variation.file;
                break;
            case "update":
                method = "PUT";
                break;
        }

        const requestOptions = {
            path: `/create-block-theme/v1/theme-variations/`,
            data: { ...requestData },
            method,
        };

        try {
            const data = await apiFetch(requestOptions);
            setVariations( data );
            createSuccessNotice( __("Theme variation deleted", "create-block-theme"), { type: 'snackbar' });
        } catch (e) {
            createErrorNotice( e.message, { type: 'snackbar' } );
        }
        
    }

    const handleConfirm = () => {
        applyChange();
        setConfirmActionIsOpen(false);
        setVariation(null);
    }

    const handleCancel = () => {
        setAction(null);
        setConfirmActionIsOpen(false);
        setVariation(null);
        console.log('cancel');
    }

    return (
        <SidebarSection title={ __("Theme Style Variations", "create-block-theme") }>


            <ConfirmDialog
                isOpen={ confirmActionIsOpen }
                onConfirm={ handleConfirm }
                onCancel={ handleCancel }
            >
                { ( action === "new" ) && (
                    <>
                        <Heading level={4}>{__("Create Style Variation", "create-block-theme")}</Heading>
                        <Spacer />
                        <Text>{ __(`This action will save your current Global Styles as a theme variation`, "create-block-theme") }</Text>
                        <Spacer margin={8}/>
                        <InputControl label={ __("Title", "create-block-theme") } />
                    </>
                )}
                { ( action === "delete" && variation ) && (
                    <>
                        <Heading level={4}>{__("Delete Style Variation", "create-block-theme")}</Heading>
                        <Spacer margin={8}/>
                        <Text>{ __(`Are you sure you want to delete ${variation.title} style variation?`, "create-block-theme") }</Text>
                    </>
                )}
                { ( action === "update" && variation ) && (
                    <>
                        <Heading level={4}>{__("Update Style Variation", "create-block-theme")}</Heading>
                        <Spacer margin={8}/>
                        <Text as="p">{ __( `This action will get your current global styles settings and store them as ${variation.title} variation.`, "create-block-theme" )}</Text>
                        <Text as="p">{ __( `The old content of ${variation.title} will be overwritten.`, "create-block-theme" ) }</Text>
                    </>
                )}
            </ConfirmDialog>


            <Text variant="muted">{ __( "New Style Variation:", "create-block-theme" ) }</Text>
            <Spacer />
            <ItemGroup isBordered isSeparated >
                <Item onClick={ () => handleAskConfirm ( 'new', null ) }>
                    <HStack justify="space-between">
                        <Text>{__("Create Style Variation", "create-block-theme")}</Text>
                        <Button isSmall icon={plusCircleFilled} iconSize={15}/>
                    </HStack>
                </Item>
            </ItemGroup>

            <Spacer margin={8} />

            <Text variant="muted">{ __( "Available style variations:", "create-block-theme" ) }</Text>
            <Spacer />
            <ItemGroup isBordered isSeparated>
                {variations.map((variation) => (
                    <Item key={variation.file}>
                        <HStack justify="space-between">
                            <Text>{variation.title}</Text>
                            {/* <Button isSmall icon={trash} iconSize={15}/> */}

                            <DropdownMenu
                                controls={[
                                    {
                                        icon: pencil,
                                        iconSize: 15,
                                        onClick: () => handleAskConfirm( 'update', variation ),
                                        title: __("Update style variation", "create-block-theme")
                                    },
                                    {
                                        icon: trash,
                                        iconSize: 15,
                                        onClick: () => handleAskConfirm( 'delete', variation ),
                                        title: __("Delete style variation", "create-block-theme")
                                    },
                                ]}
                                icon={moreVertical}
                                label={ __( "Style variation actions", "create-block-theme" ) }
                            />
                        </HStack>

                    </Item>
                ))}
            </ItemGroup>

        </SidebarSection> 
    );
}

export default ThemeVariations;
