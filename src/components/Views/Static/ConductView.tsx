import {PaddedContentView} from '../Content/PaddedContentView';
import {Text} from 'react-native-paper';
import {BoldText} from '../../Text/BoldText';
import React from 'react';
import {View} from 'react-native';
import {ConductDocDocument} from '../../../libraries/Structs/SiteStructs';

export const ConductView = ({docs}: {docs: (ConductDocDocument | undefined)[]}) => {
  return (
    <View>
      {docs.map((doc, docIndex) => {
        if (!doc) {
          return;
        }
        return (
          <View key={docIndex}>
            <PaddedContentView>
              {doc.header && (
                <Text style={{fontWeight: 'bold'}} variant={'titleLarge'}>
                  {doc.header}
                </Text>
              )}
            </PaddedContentView>
            {doc.sections?.map((section, sectionIndex) => {
              return (
                <View key={sectionIndex}>
                  {section.header && (
                    <PaddedContentView>
                      <BoldText>{section.header}</BoldText>
                    </PaddedContentView>
                  )}
                  {section.paragraphs?.map((paragraph, paragraphIndex) => {
                    return (
                      <View key={paragraphIndex}>
                        {paragraph.text && (
                          <PaddedContentView>
                            <Text>{paragraph.text}</Text>
                          </PaddedContentView>
                        )}
                        {paragraph.list?.map((listItem, listItemIndex) => {
                          return (
                            <PaddedContentView key={listItemIndex}>
                              <Text>{listItem}</Text>
                            </PaddedContentView>
                          );
                        })}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};
