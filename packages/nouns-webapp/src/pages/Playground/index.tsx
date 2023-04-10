/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Container,
  Col,
  Button,
  Image,
  Row,
  FloatingLabel,
  Form,
  OverlayTrigger,
  Popover,
} from 'react-bootstrap';
import classes from './Playground.module.css';
import React, { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react';
// import Link from '../../components/Link';
import { ImageData, getNounData, getRandomNounSeed } from '@nouns/assets';
import { buildSVG, EncodedImage, PNGCollectionEncoder } from '@nouns/sdk';
import InfoIcon from '../../assets/icons/Info.svg';
import Noun from '../../components/Noun';
import NounModal from './NounModal';
import { PNG } from 'pngjs';
import { Trans } from '@lingui/macro';
import { i18n } from '@lingui/core';
import cx from 'classnames';

interface Trait {
  title: string;
  traitNames: string[];
}
interface NounToDisplay {
  nounSvg: string;
  traits?: {
    title: string;
    artist: string;
  }[];
  artists: string[];
}

interface PendingCustomTrait {
  type: string;
  data: string;
  filename: string;
}

// const nounsProtocolLink = (
//   <Link
//     text={<Trans>Nouns Protocol</Trans>}
//     url="https://www.notion.so/Noun-Protocol-32e4f0bf74fe433e927e2ea35e52a507"
//     leavesPage={true}
//   />
// );

// const nounsAssetsLink = (
//   <Link
//     text="nouns-assets"
//     url="https://github.com/nounsDAO/nouns-monorepo/tree/master/packages/nouns-assets"
//     leavesPage={true}
//   />
// );

// const nounsSDKLink = (
//   <Link
//     text="nouns-sdk"
//     url="https://github.com/nounsDAO/nouns-monorepo/tree/master/packages/nouns-sdk"
//     leavesPage={true}
//   />
// );

const DEFAULT_TRAIT_TYPE = 'heads';

const encoder = new PNGCollectionEncoder(ImageData.palette);

const traitKeyToTitle: Record<string, string> = {
  heads: 'head',
  glasses: 'glasses',
  bodies: 'body',
  accessories: 'accessory',
};

const parseTraitName = (partName: string): string =>
  capitalizeFirstLetter(partName.substring(partName.indexOf('-') + 1));

const capitalizeFirstLetter = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

const traitKeyToLocalizedTraitKeyFirstLetterCapitalized = (s: string): ReactNode => {
  const traitMap = new Map([
    ['background', <Trans>Background</Trans>],
    ['body', <Trans>Body</Trans>],
    ['accessory', <Trans>Accessory</Trans>],
    ['head', <Trans>Head</Trans>],
    ['glasses', <Trans>Glasses</Trans>],
  ]);

  return traitMap.get(s);
};

const Playground: React.FC = () => {
  const [nounSvgs, setNounSvgs] = useState<string[]>();
  const [nounsToDisplay, setNounsToDisplay] = useState<NounToDisplay[]>([]);
  const [createdNouns, setCreatedNouns] = useState<NounToDisplay[]>([]);
  const [traits, setTraits] = useState<Trait[]>();
  const [modSeed, setModSeed] = useState<{ [key: string]: number }>();
  const [initLoad, setInitLoad] = useState<boolean>(true);
  const [
    showNounDetails,
    // setShowNounDetails
  ] = useState<boolean>(false);
  const [displayNoun, setDisplayNoun] = useState<boolean>(false);
  const [indexOfNounToDisplay, setIndexOfNounToDisplay] = useState<number>();
  const [selectIndexes, setSelectIndexes] = useState<Record<string, number>>({});
  const [pendingTrait, setPendingTrait] = useState<PendingCustomTrait>();
  const [isPendingTraitValid, setPendingTraitValid] = useState<boolean>();
  const [artistsList] = useState<string[]>([]);
  const [filterArtistIndex, setFilterArtistIndex] = useState<number>(-1);

  const customTraitFileRef = useRef<HTMLInputElement>(null);

  const traitTitles = ['background', 'body', 'accessory', 'head', 'glasses'];

  const traitNames = [
    ['cool', 'warm'],
    ...Object.values(ImageData.images).map(i => {
      return i.map(imageData => imageData.filename);
    }),
  ];
  const traitArtists = [
    ['nounders', 'nounders'],
    ...Object.values(ImageData.images).map(i => {
      return i.map(imageData => imageData.artist);
    }),
  ];

  const generateNounSvg = React.useCallback(
    (amount: number = 1) => {
      // const traitTitles = ['background', 'body', 'accessory', 'head', 'glasses'];
      // const traitNames = [
      //   ['cool', 'warm'],
      //   ...Object.values(ImageData.images).map(i => {
      //     return i.map(imageData => imageData.filename);
      //   }),
      // ];

      for (let i = 0; i < amount; i++) {
        const seed = { ...getRandomNounSeed(), ...modSeed };
        // console.log("seed", seed);
        const { parts, background } = getNounData(seed);
        const svg = buildSVG(parts, encoder.data.palette, background);

        const nounTraits: { title: string; artist: string }[] = [];
        const nounTraitArtists: string[] = [];

        // const nounTraits: string[] = [];
        Object.values(seed).forEach((val, index) => {
          const traitTitle = traitNames[index][val];
          const traitArtist = traitArtists[index][val];
          const item = { title: traitTitle, artist: traitArtist };
          nounTraits.push(item);
          nounTraitArtists.push(traitArtist);
        });
        // const nounToDisplay: NounToDisplay = {
        //   nounSVG: svg,
        //   traits: nounTraits,
        // };

        // setNounTraits(prevTraits => {
        //   return prevTraits ? [
        //   ...prevTraits,
        //   {seed: 'seed', traits: nounTraits},
        // ] : [{seed: 'seed', traits: nounTraits}]});

        setCreatedNouns(prevTraits => {
          return prevTraits
            ? [{ nounSvg: svg, artists: nounTraitArtists, traits: nounTraits }, ...prevTraits]
            : [{ nounSvg: svg, artists: nounTraitArtists, traits: nounTraits }];
        });

        setNounSvgs(prev => {
          return prev ? [svg, ...prev] : [svg];
        });

        // setNounsToDisplay(prevNouns => {
        //   return prevNouns ? [
        //     prevNouns, nounToDisplay
        //   ] : [nounToDisplay]
        // })
        // setNounsToDisplay(prevNouns => {
        //   return prevNouns ? [
        //     prevNouns, {nounSVG: svg, traits: nounTraits}
        //   ] : {nounSVG: svg, traits: nounTraits}
        // })

        // setNounTraits(prevTrait => {
        //   // return prevTrait ? [nounTraits, ...prevTrait] : [nounTraits];
        //   return prevTrait ? [nounTraits, ...prevTrait] : ["",""];
        // });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pendingTrait, modSeed],
  );

  const handleArtistFilter = (artistIndex: string) => {
    const indexNum = parseInt(artistIndex);
    setFilterArtistIndex(indexNum);
    const filtered = createdNouns.filter(noun => {
      console.log('artist', artistIndex);
      if (indexNum >= 0) {
        return noun.artists.includes(artistsList[parseInt(artistIndex)]);
      } else {
        return createdNouns;
      }
    });
    setNounsToDisplay(filtered);
  };

  useEffect(() => {
    // eslint-disable-next-line array-callback-return
    Object.values(ImageData.images).map(i => {
      // eslint-disable-next-line array-callback-return
      i.map(imageData => {
        if (artistsList.indexOf(imageData.artist) === -1) {
          artistsList.push(imageData.artist);
        }
      });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const traitTitles = ['background', 'body', 'accessory', 'head', 'glasses'];
    const traitNames = [
      ['cool', 'warm'],
      ...Object.values(ImageData.images).map(i => {
        return i.map(imageData => imageData.filename);
      }),
    ];
    setTraits(
      traitTitles.map((value, index) => {
        return {
          title: value,
          traitNames: traitNames[index],
        };
      }),
    );

    if (initLoad) {
      generateNounSvg(200);
      setInitLoad(false);
    }
    setNounsToDisplay(createdNouns);
    setFilterArtistIndex(-1);
    console.log('createdNouns', createdNouns, nounsToDisplay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generateNounSvg, initLoad, createdNouns]);

  const traitOptions = (trait: Trait) => {
    return Array.from(Array(trait.traitNames.length + 1)).map((_, index) => {
      const traitName = trait.traitNames[index - 1];
      const parsedTitle = index === 0 ? `Random` : parseTraitName(traitName);
      return (
        <option key={index} value={traitName}>
          {parsedTitle}
        </option>
      );
    });
  };

  const traitButtonHandler = (trait: Trait, traitIndex: number) => {
    setModSeed(prev => {
      // -1 traitIndex = random
      if (traitIndex < 0) {
        let state = { ...prev };
        delete state[trait.title];
        return state;
      }
      return {
        ...prev,
        [trait.title]: traitIndex,
      };
    });
  };

  const resetTraitFileUpload = () => {
    if (customTraitFileRef.current) {
      customTraitFileRef.current.value = '';
    }
  };

  let pendingTraitErrorTimeout: NodeJS.Timeout;
  const setPendingTraitInvalid = () => {
    setPendingTraitValid(false);
    resetTraitFileUpload();
    pendingTraitErrorTimeout = setTimeout(() => {
      setPendingTraitValid(undefined);
    }, 5_000);
  };

  const validateAndSetCustomTrait = (file: File | undefined) => {
    if (pendingTraitErrorTimeout) {
      clearTimeout(pendingTraitErrorTimeout);
    }
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const buffer = Buffer.from(e?.target?.result!);
        const png = PNG.sync.read(buffer);
        if (png.width !== 32 || png.height !== 32) {
          throw new Error('Image must be 32x32');
        }
        const filename = file.name?.replace('.png', '') || 'custom';
        const data = encoder.encodeImage(filename, {
          width: png.width,
          height: png.height,
          rgbaAt: (x: number, y: number) => {
            const idx = (png.width * y + x) << 2;
            const [r, g, b, a] = [
              png.data[idx],
              png.data[idx + 1],
              png.data[idx + 2],
              png.data[idx + 3],
            ];
            return {
              r,
              g,
              b,
              a,
            };
          },
        });
        setPendingTrait({
          data,
          filename,
          type: DEFAULT_TRAIT_TYPE,
        });
        setPendingTraitValid(true);
      } catch (error) {
        setPendingTraitInvalid();
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const uploadCustomTrait = () => {
    const { type, data, filename } = pendingTrait || {};
    if (type && data && filename) {
      const images = ImageData.images as Record<string, EncodedImage[]>;
      images[type].unshift({
        filename,
        data,
      });
      const title = traitKeyToTitle[type];
      const trait = traits?.find(t => t.title === title);

      resetTraitFileUpload();
      setPendingTrait(undefined);
      setPendingTraitValid(undefined);
      traitButtonHandler(trait!, 0);
      setSelectIndexes({
        ...selectIndexes,
        [title]: 0,
      });
    }
  };

  return (
    <>
      {displayNoun && indexOfNounToDisplay !== undefined && nounSvgs && (
        <NounModal
          onDismiss={() => {
            setDisplayNoun(false);
          }}
          svg={nounSvgs[indexOfNounToDisplay]}
          traits={nounsToDisplay[indexOfNounToDisplay].traits}
        />
      )}

      <Container fluid="lg">
        <Row className="my-5">
          <Col lg={2}>
            <Button
              onClick={() => {
                generateNounSvg();
              }}
              className={classes.primaryBtn}
            >
              <Trans>Generate Nouns</Trans>
            </Button>
          </Col>
          {traits &&
            traits.map((trait, index) => {
              return (
                <Col lg={2} xs={6}>
                  <Form className={classes.traitForm}>
                    <FloatingLabel
                      controlId="floatingSelect"
                      label={traitKeyToLocalizedTraitKeyFirstLetterCapitalized(trait.title)}
                      key={index}
                      className={classes.floatingLabel}
                    >
                      <Form.Select
                        aria-label="Floating label select example"
                        className={classes.traitFormBtn}
                        value={trait.traitNames[selectIndexes?.[trait.title]] ?? -1}
                        onChange={e => {
                          let index = e.currentTarget.selectedIndex;
                          traitButtonHandler(trait, index - 1); // - 1 to account for 'random'
                          setSelectIndexes({
                            ...selectIndexes,
                            [trait.title]: index - 1,
                          });
                        }}
                      >
                        {traitOptions(trait)}
                      </Form.Select>
                    </FloatingLabel>
                  </Form>
                </Col>
              );
            })}
          {/* </Col> */}
          {/* </Col> */}
          <Row>
            <Col lg={2}>
              {/* <button
                onClick={() => setShowNounDetails(!showNounDetails)}
                style={{
                  fontSize: '10px',
                }}
              >
                Show/hide Noun details
              </button> */}
            </Col>
            {/* <Col lg={6}>
              <Form className={classes.traitForm}>
                <FloatingLabel
                  controlId="floatingSelect"
                  label="Filter by artist"
                  key="artistFilter"
                  className={classes.floatingLabel}
                >
                  <Form.Select
                    aria-label=""
                    className={classes.traitFormBtn}
                    value={filterArtistIndex}
                    onChange={e => {
                      handleArtistFilter(e.target.value);
                      // setFilterArtist(e.target.value)
                    }}
                  >
                    <option value="-1">Filter by artist</option>
                    {artistsList &&
                      artistsList.map((artist, i) => {
                        return <option value={i}>{artist}</option>;
                      })}
                  </Form.Select>
                </FloatingLabel>
              </Form>
            </Col> */}
          </Row>
        </Row>

        <Row>
          <div className="d-none">
            <label style={{ margin: '1rem 0 .25rem 0' }} htmlFor="custom-trait-upload">
              <Trans>Upload Custom Trait</Trans>
              <OverlayTrigger
                trigger="hover"
                placement="top"
                overlay={
                  <Popover>
                    <div style={{ padding: '0.25rem' }}>
                      <Trans>Only 32x32 PNG images are accepted</Trans>
                    </div>
                  </Popover>
                }
              >
                <Image
                  style={{ margin: '0 0 .25rem .25rem' }}
                  src={InfoIcon}
                  className={classes.voteIcon}
                />
              </OverlayTrigger>
            </label>
            <Form.Control
              type="file"
              id="custom-trait-upload"
              accept="image/PNG"
              isValid={isPendingTraitValid}
              isInvalid={isPendingTraitValid === false}
              ref={customTraitFileRef}
              className={classes.fileUpload}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                validateAndSetCustomTrait(e.target.files?.[0])
              }
            />
            {pendingTrait && (
              <>
                <FloatingLabel label="Custom Trait Type" className={classes.floatingLabel}>
                  <Form.Select
                    aria-label="Custom Trait Type"
                    className={classes.traitFormBtn}
                    onChange={e => setPendingTrait({ ...pendingTrait, type: e.target.value })}
                  >
                    {Object.entries(traitKeyToTitle).map(([key, title]) => (
                      <option value={key}>{capitalizeFirstLetter(title)}</option>
                    ))}
                  </Form.Select>
                </FloatingLabel>
                <Button onClick={() => uploadCustomTrait()} className={classes.primaryBtn}>
                  <Trans>Upload</Trans>
                </Button>
              </>
            )}
            <p className={classes.nounYearsFooter}>
              <Trans>
                You've generated{' '}
                {i18n.number(parseInt(nounSvgs ? (nounSvgs.length / 365).toFixed(2) : '0'))} years
                worth of Nouns
              </Trans>
            </p>
          </div>
          <Col>
            <Row>
              {nounsToDisplay &&
                nounsToDisplay.map((noun, i) => {
                  // console.log(nounTraits[i])

                  return (
                    <Col xs={3} lg={3} xxl={2} key={i}>
                      <div
                        onClick={() => {
                          setIndexOfNounToDisplay(i);
                          setDisplayNoun(true);
                        }}
                        className={cx(
                          classes.nounDetailsWrapper,
                          showNounDetails && classes.active,
                        )}
                      >
                        <Noun
                          imgPath={`data:image/svg+xml;base64,${btoa(noun.nounSvg)}`}
                          alt="noun"
                          className={classes.nounImg}
                          wrapperClassName={classes.nounWrapper}
                        />
                        {showNounDetails && (
                          <ul>
                            {nounsToDisplay[i].traits?.map((trait, index) => {
                              return (
                                <li>
                                  <span>{traitTitles[index]}:</span> {trait.title} by{' '}
                                  <strong>{trait.artist}</strong>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </Col>
                  );
                })}
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};
export default Playground;
