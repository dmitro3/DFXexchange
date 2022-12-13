import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBuyContext } from '../../../api/contexts/buy.context';
import { Asset } from '../../../api/definitions/asset';
import { BankAccount } from '../../../api/definitions/bank-account';
import { Buy, BuyPaymentInfo } from '../../../api/definitions/buy';
import { Fiat } from '../../../api/definitions/fiat';
import DfxIcon, { IconColors, IconVariant } from '../../../stories/DfxIcon';
import Form from '../../../stories/form/Form';
import StyledInput from '../../../stories/form/StyledInput';
import StyledModalDropdown from '../../../stories/form/StyledModalDropdown';
import StyledButton from '../../../stories/StyledButton';
import StyledCoinListItem from '../../../stories/StyledCoinListItem';
import { IconButton } from '../../../stories/StyledIconButton.stories';
import { AddBankAccount } from '../../add-bank-account';
import { BuyTabDefinitions } from '../buy.tab';
import debounce from 'debounce';
import { Utils } from '../../../utils';
import Validations from '../../../validations';
import StyledDataTable, { AlignContent } from '../../../stories/StyledDataTable';
import StyledDataTableRow from '../../../stories/StyledDataTableRow';
import StyledIconButton from '../../../stories/StyledIconButton';
import { useClipboard } from '../../../hooks/clipboard.hook';

interface BuyTabContentProcessProps {
  asset?: Asset;
  onBack: () => void;
}

interface FormData {
  bankAccount: BankAccount;
  currency: Fiat;
  asset: Asset;
  amount: string;
}

export function BuyTabContentProcess({ asset, onBack }: BuyTabContentProcessProps): JSX.Element {
  const { currencies, bankAccounts, receiveFor } = useBuyContext();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInformation>();
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
    watch,
  } = useForm<FormData>({ defaultValues: { asset } });

  const debouncedReceiveFor = useRef(
    debounce((info: BuyPaymentInfo) => {
      receiveFor(info)
        .then((value) => toPaymentInformation(value, info.bankAccount))
        .then(setPaymentInfo);
    }, 500),
  ).current;

  useEffect(() => {
    const subscription = watch(() => {
      const formData = getValues();
      if (isFormDataValid(formData)) {
        debouncedReceiveFor({ ...formData, iban: formData.bankAccount.iban, amount: Number(formData.amount) });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  async function onSubmit(_data: FormData): Promise<void> {
    // TODO (Krysh): fix broken form validation and onSubmit
  }

  function isFormDataValid(data: FormData): boolean {
    return !isNaN(+data.amount) && data.asset != null && data.bankAccount != null && data.currency != null;
  }

  function toPaymentInformation(buy: Buy, bankAccount: BankAccount): PaymentInformation {
    return {
      iban: buy.iban,
      bic: buy.bic,
      purpose: buy.remittanceInfo,
      isSepaInstant: bankAccount.sepaInstant,
      recipient: `${buy.name}, ${buy.street} ${buy.number}, ${buy.zip} ${buy.city}, ${buy.country}`,
      fee: `${buy.fee} %`,
    };
  }

  const rules = Utils.createRules({
    bankAccount: Validations.Required,
    asset: Validations.Required,
    currency: Validations.Required,
    amount: Validations.Required,
  });

  return (
    <>
      {/* CONTENT */}
      <Form control={control} rules={rules} errors={errors} onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-8">
          <IconButton icon={IconVariant.BACK} onClick={onBack} />
          {bankAccounts && (
            <StyledModalDropdown<BankAccount>
              name="bankAccount"
              labelFunc={(item) => item.iban}
              detailLabelFunc={(item) => item.label ?? ''}
              label="Your bank account"
              placeholder="Add or select your IBAN"
              modal={{
                heading: 'Select your bank account',
                items: bankAccounts,
                itemContent: (b) => (
                  <div className="flex flex-row gap-2">
                    <DfxIcon icon={IconVariant.BANK} color={IconColors.BLACK} />
                    <div className="flex flex-col gap-1">
                      {b.label && b.label.length > 0 && <p className="text-dfxGray-500">{b.label}</p>}
                      <p className="text-dfxBlue-800">{b.iban}</p>
                    </div>
                  </div>
                ),
                form: (onFormSubmit: (item: BankAccount) => void) => <AddBankAccount onSubmit={onFormSubmit} />,
              }}
            />
          )}
          {asset && (
            <StyledCoinListItem
              asset={asset.name}
              protocol={BuyTabDefinitions.protocols[asset.blockchain]}
              onClick={() => {
                console.log('just a placeholder');
              }}
            />
          )}
          {currencies && (
            <StyledModalDropdown<Fiat>
              name="currency"
              labelFunc={(item: Fiat) => item.name}
              label="YOUR CURRENCY"
              placeholder="e.g. EUR"
              modal={{
                heading: 'Select your currency',
                items: currencies,
                itemContent: (c: Fiat) => (
                  <div className="flex flex-row gap-2">
                    <p className="text-dfxBlue-800">{c.name}</p>
                  </div>
                ),
              }}
            />
          )}
        </div>
        <StyledInput label="Buy amount" placeholder="0.00" name="amount" />
      </Form>
      {paymentInfo && (
        <>
          <PaymentInformationContent info={paymentInfo} />
          <StyledButton label="Click once your bank Transfer is completed." onClick={onBack} caps={false} />
        </>
      )}
    </>
  );
}

interface PaymentInformation {
  iban: string;
  isSepaInstant: boolean;
  bic: string;
  purpose: string;
  recipient: string;
  fee: string;
}

interface PaymentInformationContentProps {
  info: PaymentInformation;
}

function PaymentInformationContent({ info }: PaymentInformationContentProps): JSX.Element {
  const { copy } = useClipboard();
  return (
    <>
      <h2>Payment Information</h2>
      <p>
        Please transfer the purchase amount using this information via your banking application. The purpose of payment
        is important!
      </p>
      <StyledDataTable darkTheme={false} alignContent={AlignContent.RIGHT} showBorder>
        <StyledDataTableRow label="IBAN">
          {info.iban}
          <StyledIconButton icon={IconVariant.COPY} onClick={() => copy(info.iban)} />
        </StyledDataTableRow>
        <StyledDataTableRow label="BIC">
          {info.bic}
          <StyledIconButton icon={IconVariant.COPY} onClick={() => copy(info.bic)} />
        </StyledDataTableRow>
        <StyledDataTableRow label="Purpose of payment">
          {info.purpose}
          <StyledIconButton icon={IconVariant.COPY} onClick={() => copy(info.purpose)} />
        </StyledDataTableRow>
      </StyledDataTable>
      <StyledDataTable label="Recipient" darkTheme={false} showBorder>
        <StyledDataTableRow>{info.recipient}</StyledDataTableRow>
      </StyledDataTable>
      <StyledDataTable darkTheme={false} alignContent={AlignContent.BETWEEN}>
        <StyledDataTableRow discreet>
          <p>DFX-Fee</p>
          <p>{info.fee}</p>
        </StyledDataTableRow>
      </StyledDataTable>
    </>
  );
}
